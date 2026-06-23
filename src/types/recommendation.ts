import type { CourseResponse } from "./course";

export interface AgentEnvelope<T = any> {
  type: string;
  messageId: string | null;
  runId: string | null;
  sessionId: string | null;
  seq: number;
  timestamp: string;
  data: T;
}

export interface Citation {
  sourceType?: string;
  title?: string;
  courseId?: string;
  sourceUrl?: string;
  score?: number;
}

export interface SuggestedAction {
  label: string;
  payload: string;
  type?: string;
}

export interface ProposalItem {
  courseId: string;
  courseTitle: string;
  courseUrl?: string;
  lessonId: string;
  lessonTitle: string;
  orderIndex: number;
  isSuggested: boolean;
}

export interface LearningPathProposalResponse {
  proposalId: string;
  sessionId: string;
  version: number;
  title: string;
  description: string;
  courseIds: string[];
  candidateCourseIds: string[];
  status: "PROPOSED" | "CREATED";
  items: ProposalItem[];
}

export interface AgentPart {
  partId: string;
  partType: "text" | "course_list" | "policy_result" | "learning_path" | "action_result" | "suggested_actions";
  status: "created" | "updated" | "done" | "error";
  title?: string;
  content?: string; // used for delta/text accumulation
  courses?: CourseResponse[]; // resolved full course responses
  proposal?: LearningPathProposalResponse;
  result?: any;
  error?: any;
  suggestedActions?: SuggestedAction[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts: AgentPart[];
  citations: Citation[];
  actions: SuggestedAction[];
  timestamp?: string;
}

export interface AgentChatState {
  sessionId: string | null;
  currentRunId: string | null;
  messages: ChatMessage[];
  activeMessageId: string | null;
  activeProposal: LearningPathProposalResponse | null;
  isStreaming: boolean;
  error: string | null;
}

export type ProposalOperation =
  | { operation: "UPDATE_METADATA"; title: string; description: string; version: number }
  | { operation: "ADD_COURSE"; courseId: string; version: number }
  | { operation: "ADD_COURSE"; query: string; version: number }
  | { operation: "REMOVE_COURSE"; courseId: string; version: number }
  | { operation: "ADD_LESSON"; courseId: string; lessonId: string; version: number }
  | { operation: "REMOVE_LESSON"; lessonId: string; version: number }
  | { operation: "MOVE_LESSON"; lessonId: string; orderIndex: number; version: number };
