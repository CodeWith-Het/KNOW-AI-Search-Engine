import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Globe, Sparkles } from "lucide-react";

const MAX_HEIGHT = 200;

const Composer = ({
  onSend,
  sending,
  autoFocus,
  placeholder = "Ask anything...",
}) => {
  const [value, setValue] = useState("");
  const [webMode, setWebMode] = useState(false); // 🔥 WEB MODE TOGGLE
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    setValue("");
    try {
      await onSend(
        trimmed,
        deepResearchMode ? "deep_research" : webMode ? "web" : "chat",
      ); // 🔥 MODE PASS KIYA
    } catch {
      setValue(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-[#17191c] shadow-lg focus-within:border-[#e8a33d]/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={1}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-[#ece9e2] placeholder-[#ece9e2]/35 outline-none disabled:opacity-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />

        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#ece9e2]/45 hover:bg-white/5 hover:text-[#ece9e2]/80"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </button>
            {/* 🔥 WEB BUTTON ACTIVE STATE */}
            <button
              type="button"
              onClick={() => setWebMode(!webMode)}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                webMode
                  ? "bg-[#e8a33d]/20 text-[#e8a33d]"
                  : "text-[#ece9e2]/45 hover:bg-white/5 hover:text-[#ece9e2]/80"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Web</span>
            </button>
            <button
              type="button"
              aria-pressed={deepResearchMode}
              onClick={() => {
                setDeepResearchMode((enabled) => !enabled);
                setWebMode(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-all duration-300 ${
                deepResearchMode
                  ? "border-[#8b7bff]/70 bg-gradient-to-r from-[#2563eb]/30 via-[#5b4fe9]/25 to-[#8b5cf6]/30 text-[#d9d4ff] shadow-[0_0_18px_rgba(91,79,233,0.38)] animate-deep-research-glow"
                  : "border-transparent text-[#ece9e2]/45 hover:bg-white/5 hover:text-[#ece9e2]/80"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden items-center gap-1 sm:flex">
                {deepResearchMode ? "✓ Deep Research ON" : "Deep Research"}
              </span>
              {deepResearchMode && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa]"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={sending || !value.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8a33d] text-[#101214] transition-colors hover:bg-[#f0b563] disabled:bg-white/10 disabled:text-[#ece9e2]/30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
