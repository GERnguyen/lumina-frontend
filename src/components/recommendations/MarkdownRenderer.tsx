import React from "react";

function parseInline(text: string): React.ReactNode[] {
  let parts: (string | React.ReactElement)[] = [text];

  // Bold **text**
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return [part];
    const subParts = part.split(/(\*\*.*?\*\*)/g);
    return subParts.map((sub, idx) => {
      if (sub.startsWith("**") && sub.endsWith("**")) {
        return <strong key={`b-${idx}`} className="font-bold text-[#1C1E23]">{sub.slice(2, -2)}</strong>;
      }
      return sub;
    });
  });

  // Italics *text* or _text_
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return [part];
    const subParts = part.split(/(\*.*?\*)/g);
    return subParts.map((sub, idx) => {
      if (sub.startsWith("*") && sub.endsWith("*")) {
        return <em key={`i-${idx}`} className="italic">{sub.slice(1, -1)}</em>;
      }
      return sub;
    });
  });

  // Inline code `code`
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return [part];
    const subParts = part.split(/(`.*?`)/g);
    return subParts.map((sub, idx) => {
      if (sub.startsWith("`") && sub.endsWith("`")) {
        return <code key={`c-${idx}`} className="rounded bg-[#F1F2F4] px-1.5 py-0.5 text-xs text-[#EB5757] font-mono">{sub.slice(1, -1)}</code>;
      }
      return sub;
    });
  });

  return parts;
}

function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <pre key={`cb-${idx}`} className="my-3 overflow-x-auto rounded-xl bg-[#1C1E23] p-4 text-xs text-[#F1F2F4] font-mono leading-relaxed shadow-inner">
          {language && (
            <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-wider">
              {language}
            </span>
          )}
          <code>{code}</code>
        </pre>
      );
    }

    const lines = part.split("\n");
    return (
      <div key={`block-${idx}`} className="space-y-2">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Headings
          if (trimmed.startsWith("### ")) {
            return (
              <h5 key={`h3-${lIdx}`} className="text-sm font-bold text-[#1C1E23] mt-4 mb-1">
                {parseInline(trimmed.slice(4))}
              </h5>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h4 key={`h2-${lIdx}`} className="text-base font-bold text-[#1C1E23] mt-5 mb-2">
                {parseInline(trimmed.slice(3))}
              </h4>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h3 key={`h1-${lIdx}`} className="text-lg font-bold text-[#1C1E23] mt-6 mb-3">
                {parseInline(trimmed.slice(2))}
              </h3>
            );
          }

          // Bullet lists
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <ul key={`ul-${lIdx}`} className="list-disc pl-5 text-sm text-[#373A41] space-y-1 my-1">
                <li>{parseInline(trimmed.slice(2))}</li>
              </ul>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <ol key={`ol-${lIdx}`} className="list-decimal pl-5 text-sm text-[#373A41] space-y-1 my-1" start={parseInt(numMatch[1], 10)}>
                <li>{parseInline(numMatch[2])}</li>
              </ol>
            );
          }

          if (trimmed === "") {
            return <div key={`empty-${lIdx}`} className="h-1" />;
          }

          return (
            <p key={`p-${lIdx}`} className="text-sm text-[#373A41] leading-relaxed">
              {parseInline(line)}
            </p>
          );
        })}
      </div>
    );
  });
}

interface MarkdownProps {
  text: string;
}

export function Markdown({ text }: MarkdownProps) {
  if (!text) return null;
  return <div className="space-y-3">{parseMarkdown(text)}</div>;
}
