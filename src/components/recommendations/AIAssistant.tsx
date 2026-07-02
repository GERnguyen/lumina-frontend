"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import type {
  ChatMessage,
  Citation,
  SuggestedAction,
  LearningPathProposalResponse,
  CourseResponse,
  AgentPart,
} from "@/types";
import { sendAgentMessage, RecommendationApi } from "@/services/api/recommendation-api";
import { CourseApi } from "@/services/api/course-api";
import { RoadmapEditor } from "./RoadmapEditor";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

export function AIAssistant() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposal State
  const [activeProposal, setActiveProposal] = useState<LearningPathProposalResponse | null>(null);
  const [candidateCourses, setCandidateCourses] = useState<CourseResponse[]>([]);
  const [isProposalPending, startProposalTransition] = useTransition();
  const [proposalError, setProposalError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentMsgIdRef = useRef<string | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStreaming]);

  // Resolve Candidate Courses details when activeProposal changes
  useEffect(() => {
    if (!activeProposal || !activeProposal.candidateCourseIds?.length) {
      setCandidateCourses([]);
      return;
    }

    let isSubscribed = true;
    const fetchCandidates = async () => {
      try {
        const ids = activeProposal.candidateCourseIds.filter(Boolean);
        if (!ids.length) return;
        const res = await CourseApi.getCoursesByIds(ids.join(","));
        if (isSubscribed && res.data) {
          setCandidateCourses(res.data);
        }
      } catch (err) {
        console.error("Failed to load candidate course details", err);
      }
    };

    fetchCandidates();
    return () => {
      isSubscribed = false;
    };
  }, [activeProposal]);

  // Handle stream submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setError(null);

    // Add user message
    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
      parts: [],
      citations: [],
      actions: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add loading assistant message
    const assistantMsgId = `assistant_${Date.now()}`;
    currentMsgIdRef.current = assistantMsgId;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      parts: [],
      citations: [],
      actions: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      await sendAgentMessage({
        sessionId,
        message: text,
        onEvent: (eventName, payload) => {
          const currentId = currentMsgIdRef.current;
          if (!currentId) return;

          // Update sessionId if provided
          if (payload.sessionId && payload.sessionId !== sessionId) {
            setSessionId(payload.sessionId);
          }

          setMessages((prevMessages) => {
            return prevMessages.map((msg) => {
              if (msg.id !== currentId) return msg;

              let updatedParts = [...msg.parts];
              let updatedCitations = [...msg.citations];
              let updatedActions = [...msg.actions];
              let updatedContent = msg.content;

              switch (eventName) {
                case "run_started":
                  break;

                case "part_created": {
                  const partData = payload.data as { partId: string; partType: any; status: any; titleKey?: string };
                  if (!updatedParts.some((p) => p.partId === partData.partId)) {
                    updatedParts.push({
                      partId: partData.partId,
                      partType: partData.partType,
                      status: "created",
                      title: partData.titleKey,
                      content: "",
                    });
                  }
                  break;
                }

                case "part_delta": {
                  const deltaData = payload.data as { partId: string; delta: string };
                  updatedParts = updatedParts.map((p) => {
                    if (p.partId !== deltaData.partId) return p;
                    const newContent = (p.content || "") + deltaData.delta;
                    if (p.partType === "text") {
                      updatedContent = newContent;
                    }
                    return { ...p, content: newContent };
                  });
                  break;
                }

                case "part_updated": {
                  const updateData = payload.data as {
                    partId: string;
                    items?: any[];
                    proposal?: LearningPathProposalResponse;
                    result?: any;
                    error?: any;
                  };

                  updatedParts = updatedParts.map((p) => {
                    if (p.partId !== updateData.partId) return p;
                    
                    const updatedPart: AgentPart = { ...p, status: "updated" };
                    
                    if (updateData.proposal) {
                      updatedPart.proposal = updateData.proposal;
                      // Hide active proposal editor if status is CREATED, otherwise set active
                      if (updateData.proposal.status === "CREATED") {
                        setActiveProposal(null);
                      } else {
                        setActiveProposal(updateData.proposal);
                      }
                    }
                    if (updateData.result) {
                      updatedPart.result = updateData.result;
                    }
                    if (updateData.error) {
                      updatedPart.error = updateData.error;
                      updatedPart.status = "error";
                    }
                    return updatedPart;
                  });

                  if (updateData.items && updateData.items.length > 0) {
                    const partIndex = updatedParts.findIndex((p) => p.partId === updateData.partId);
                    if (partIndex !== -1 && updatedParts[partIndex].partType === "course_list") {
                      resolveCourseDetails(updateData.partId, updateData.items.map((i) => i.courseId));
                    }
                  }
                  break;
                }

                case "part_done": {
                  const doneData = payload.data as { partId: string };
                  updatedParts = updatedParts.map((p) => {
                    if (p.partId === doneData.partId) {
                      return { ...p, status: "done" };
                    }
                    return p;
                  });
                  break;
                }

                case "citation_added": {
                  const citationData = payload.data as Citation;
                  const isDuplicate = updatedCitations.some((c) => {
                    if (c.sourceUrl && citationData.sourceUrl) {
                      return c.sourceUrl === citationData.sourceUrl;
                    }
                    if (c.courseId && citationData.courseId) {
                      return c.courseId === citationData.courseId;
                    }
                    return c.title === citationData.title;
                  });
                  if (!isDuplicate) {
                    updatedCitations.push(citationData);
                  }
                  break;
                }

                case "final": {
                  const finalData = payload.data as {
                    message: {
                      content: string;
                      actions?: SuggestedAction[];
                    };
                  };
                  if (finalData.message?.actions) {
                    updatedActions = finalData.message.actions;
                  }
                  break;
                }

                case "error":
                  setError(String(payload.data || "Unknown stream error"));
                  break;
              }

              return {
                ...msg,
                parts: updatedParts,
                citations: updatedCitations,
                actions: updatedActions,
                content: updatedContent,
              };
            });
          });
        },
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Lỗi khi kết nối với Assistant.");
    } finally {
      setIsStreaming(false);
    }
  };

  // Helper to fetch details of courses in parts dynamically
  const resolveCourseDetails = async (partId: string, courseIds: string[]) => {
    try {
      const ids = courseIds.filter(Boolean);
      if (!ids.length) return;
      const res = await CourseApi.getCoursesByIds(ids.join(","));
      if (res.data) {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            const hasPart = msg.parts.some((p) => p.partId === partId);
            if (!hasPart) return msg;

            return {
              ...msg,
              parts: msg.parts.map((p) => {
                if (p.partId !== partId) return p;
                return { ...p, courses: res.data };
              }),
            };
          });
        });
      }
    } catch (err) {
      console.error("Error resolving courses list in parts", err);
    }
  };

  // Mutate Proposal Helper
  const handleMutateProposal = (operation: any) => {
    if (!sessionId || !activeProposal) return;
    setProposalError(null);

    startProposalTransition(async () => {
      try {
        const payload = {
          version: activeProposal.version,
          ...operation,
        };
        const updatedProposal = await RecommendationApi.patchProposal(sessionId, payload);
        
        // Synchronize updated proposal back to messages list
        setMessages((prev) =>
          prev.map((msg) => {
            const hasMatchingProposal = msg.parts.some(
              (p) => p.partType === "learning_path" && p.proposal?.proposalId === updatedProposal.proposalId
            );
            if (!hasMatchingProposal) return msg;

            return {
              ...msg,
              parts: msg.parts.map((p) => {
                if (p.partType === "learning_path" && p.proposal?.proposalId === updatedProposal.proposalId) {
                  return {
                    ...p,
                    proposal: updatedProposal,
                  };
                }
                return p;
              }),
            };
          })
        );

        // Hide if mutated response status is CREATED, else update active proposal
        if (updatedProposal.status === "CREATED") {
          setActiveProposal(null);
        } else {
          setActiveProposal(updatedProposal);
        }

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return prev.map((msg, idx) => {
              if (idx !== prev.length - 1) return msg;
              return {
                ...msg,
                content: msg.content + `\n\n*(Lộ trình đã được cập nhật: ${operation.operation})*`,
              };
            });
          }
          return prev;
        });
      } catch (err: any) {
        console.error("Mutation failed", err);
        setProposalError(err?.message || "Không thể cập nhật lộ trình. Vui lòng làm mới.");
      }
    });
  };

  // Commit Proposal Helper
  const handleCommitProposal = async () => {
    if (!sessionId || !activeProposal) return;
    setProposalError(null);

    try {
      await RecommendationApi.createLearningPathFromProposal(sessionId, {
        proposalId: activeProposal.proposalId,
        version: activeProposal.version,
        confirmed: true,
      });

      // Update proposal status in messages to CREATED
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          parts: msg.parts.map((p) => {
            if (p.partType === "learning_path" && p.proposal?.proposalId === activeProposal.proposalId) {
              return {
                ...p,
                proposal: {
                  ...p.proposal,
                  status: "CREATED",
                },
              };
            }
            return p;
          }),
        }))
      );

      // Clear active proposal state and redirect
      setActiveProposal(null);
      router.push("/learning-paths?created=true");
    } catch (err: any) {
      console.error("Commit failed", err);
      setProposalError(err?.message || "Lỗi khi lưu lộ trình học tập.");
    }
  };

  const handleSelectProposal = (proposal: LearningPathProposalResponse) => {
    setActiveProposal(proposal);
  };

  return (
    <div className="relative mx-auto flex h-[calc(100vh-140px)] max-w-[1720px] gap-6 px-4 py-6 md:px-8">
      {/* LEFT PANEL: Chat history and input */}
      <main className="flex flex-1 flex-col rounded-[24px] border border-[#E9EAF0] bg-white shadow-sm overflow-hidden">
        {/* Chat header */}
        <ChatHeader sessionId={sessionId} />

        {/* Chat message flow */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <EmptyState onSendMessage={handleSendMessage} />
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isStreaming={isStreaming}
                activeProposal={activeProposal}
                onSendMessage={handleSendMessage}
                onSelectProposal={handleSelectProposal}
              />
            ))
          )}

          {/* Loading bubble */}
          {isStreaming && !messages[messages.length - 1]?.content && (
            <div className="flex gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="rounded-[20px] bg-[#FAFAFD] px-5 py-3 border border-[#E9EAF0] shadow-sm flex items-center gap-2 text-sm text-[#6E7485]">
                <Loader2 className="size-4 animate-spin text-[#7872FD]" />
                Agent đang phân tích yêu cầu...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-[18px] bg-[#FEEFF0] border border-[#FECACA] p-4 text-sm text-[#EB5757]">
              <AlertCircle className="size-4 shrink-0" />
              <p>Lỗi: {error}</p>
            </div>
          )}
        </div>

        {/* Input box */}
        <ChatInput isStreaming={isStreaming} onSendMessage={handleSendMessage} />
      </main>

      {/* RIGHT PANEL: Interactive learning path proposal builder */}
      {activeProposal && activeProposal.status !== "CREATED" && (
        <RoadmapEditor
          activeProposal={activeProposal}
          candidateCourses={candidateCourses}
          isProposalPending={isProposalPending}
          proposalError={proposalError}
          onMutate={handleMutateProposal}
          onCommit={handleCommitProposal}
        />
      )}
    </div>
  );
}
