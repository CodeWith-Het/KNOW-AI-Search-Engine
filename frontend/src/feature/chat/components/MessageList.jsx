import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

// [1], [2] jaise citation markers ko clickable badge mein badalta hai
const renderWithCitations = (text, citations = []) => {
  if (!citations.length) return text;
  return text.split(/(\[\d+\])/g).map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return part;
    const citation = citations.find((c) => c.id === Number(match[1]));
    if (!citation) return part;
    return (
      <a
        key={i}
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        title={citation.title}
        className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#e8a33d]/15 align-middle text-[10px] font-bold text-[#e8a33d] no-underline hover:bg-[#e8a33d]/25"
      >
        {match[1]}
      </a>
    );
  });
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-[#ece9e2]/40 hover:bg-white/5 hover:text-[#ece9e2]/80"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// 🔥 Naya Thinking Indicator (Dynamic Text ke saath)
const ThinkingIndicator = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-[#ece9e2]/60 font-mono tracking-wide">
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e8a33d] border-t-transparent" />
    <span className="ml-1">{text || "Thinking..."}</span>
  </div>
);

const MessageList = ({ chatId, messages, loading, sending }) => {
  const scrollRef = useRef(null);
  const scrollCacheRef = useRef(new Map());
  const previousCountByChatRef = useRef({});

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cachedScrollTop = scrollCacheRef.current.get(chatId);
    if (typeof cachedScrollTop === "number") {
      container.scrollTop = cachedScrollTop;
    }
  }, [chatId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const previousCount = previousCountByChatRef.current[chatId] ?? 0;
    const hasNewMessage = messages.length > previousCount;
    const lastMessage = messages[messages.length - 1];
    const shouldAutoScroll =
      hasNewMessage &&
      (lastMessage?.role === "user" ||
        (sending && lastMessage?.role === "assistant"));

    if (shouldAutoScroll) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }

    previousCountByChatRef.current[chatId] = messages.length;
    scrollCacheRef.current.set(chatId, container.scrollTop);
  }, [chatId, messages, sending]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (chatId) scrollCacheRef.current.set(chatId, container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mx-auto max-w-4xl animate-pulse space-y-2">
            <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
            <div className="h-3 w-full rounded bg-white/[0.04]" />
            <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isStreamingThis =
            sending && isLast && message.role === "assistant";

          // USER MESSAGE -> RIGHT SIDE (Yellow Bubble)
          if (message.role === "user") {
            return (
              <div key={message._id} className="flex w-full justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-[#e8a33d] px-5 py-3 text-[15px] font-medium text-[#101214] shadow-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            );
          }

          const hasContent =
            message.content && message.content.trim().length > 0;

          // AI MESSAGE -> LEFT SIDE (Dark Bubble)
          return (
            <div key={message._id} className="flex w-full justify-start">
              <div className="max-w-[95%] sm:max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-[#1c1e22] px-5 py-4 shadow-sm">
                {/* 🔥 DYNAMIC STATUS TEXT (Searching the web...) 🔥 */}
                {!hasContent && isStreamingThis ? (
                  <ThinkingIndicator text={message.status} />
                ) : (
                  <>
                    <div className="prose prose-invert prose-sm max-w-none text-[#ece9e2]/90 prose-headings:text-[#ece9e2] prose-strong:text-[#ece9e2] prose-a:text-[#e8a33d]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p>
                              {React.Children.map(children, (child) =>
                                typeof child === "string"
                                  ? renderWithCitations(
                                      child,
                                      message.citations,
                                    )
                                  : child,
                              )}
                            </p>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {isStreamingThis && (
                        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#e8a33d] align-middle" />
                      )}
                    </div>

                    {!isStreamingThis && hasContent && (
                      <div className="mt-3">
                        <CopyButton text={message.content} />
                      </div>
                    )}

                    {message.citations?.length > 0 && (
                      <div className="mt-4 border-t border-white/8 pt-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ece9e2]/30">
                          Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.citations.map((c) => (
                            <a
                              key={c.id}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="max-w-[220px] truncate rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-[#ece9e2]/55 hover:border-[#e8a33d]/30 hover:text-[#ece9e2]"
                            >
                              <span className="mr-1 text-[#e8a33d]">
                                [{c.id}]
                              </span>
                              {c.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div />
      </div>
    </div>
  );
};

export default MessageList;
