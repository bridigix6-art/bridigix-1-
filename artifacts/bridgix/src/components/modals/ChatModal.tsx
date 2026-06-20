import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/Screenshot_2026-06-04-07-57-10-533_com.canva.editor-edit_17805_1780625194177.jpg";

interface Message { role: "user" | "assistant"; content: string; }
interface ChatModalProps { open: boolean; onClose: () => void; }

const FIRST_MESSAGE = "Tell me a bit about what you're building — what does your company do?";
const LS_KEY = "bridigix_chat";
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const COOKIE_KEY = "bridigix_tz";

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getOrSetTimezone(): string {
  const stored = getCookieValue(COOKIE_KEY);
  if (stored) return stored;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  setCookie(COOKIE_KEY, tz);
  return tz;
}

function getTimeGreeting(): string {
  const tz = getOrSetTimezone();
  const now = new Date();
  const localTimeStr = now.toLocaleTimeString("en-US", { timeZone: tz, hour12: false, hour: "2-digit" });
  const hour = parseInt(localTimeStr, 10);

  if (hour >= 5 && hour < 12) {
    const opts = ["Good morning!", "Morning!", "Morning, mate!"];
    return opts[Math.floor(Math.random() * opts.length)];
  } else if (hour >= 12 && hour < 17) {
    const opts = ["Good afternoon!", "Afternoon!", "Afternoon, boss!", "Afternoon, friend!"];
    return opts[Math.floor(Math.random() * opts.length)];
  } else {
    const opts = ["Good evening!", "Evening!", "Evening, friend!", "Evening, mate!"];
    return opts[Math.floor(Math.random() * opts.length)];
  }
}

function TypingDots() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
        <img src={logoImage} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div
        className="flex items-center gap-1.5"
        style={{
          background: "rgba(26,122,74,0.07)", borderRadius: "6px 18px 18px 18px",
          padding: "14px 20px", width: "fit-content",
        }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#1A7A4A",
            opacity: 0.5,
            animation: `bounce-dot 1.2s ease infinite`,
            animationDelay: `${i * 0.22}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function useTypewriter(text: string, speed = 14, active = true) {
  const [displayed, setDisplayed] = useState(active ? "" : text);
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

function AIBubble({ content, isLatest }: { content: string; isLatest: boolean }) {
  const text = useTypewriter(content, 14, isLatest);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
        <img src={logoImage} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{
        background: "rgba(26,122,74,0.07)",
        borderRadius: "6px 18px 18px 18px",
        padding: "14px 20px",
        fontSize: 16,
        color: "#0D0D0D",
        lineHeight: 1.65,
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        maxWidth: "78%",
      }}>
        {isLatest ? text : content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex items-end justify-end gap-3">
      <div style={{
        background: "#0A0A0A",
        borderRadius: "18px 6px 18px 18px",
        padding: "14px 20px",
        fontSize: 16,
        color: "#FFFFFF",
        lineHeight: 1.65,
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        maxWidth: "72%",
      }}>
        {content}
      </div>
    </div>
  );
}

function CompletionPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center px-8 py-12"
      style={{ background: "linear-gradient(135deg, rgba(26,122,74,0.04) 0%, transparent 100%)", borderRadius: 20, border: "1px solid rgba(26,122,74,0.10)" }}
    >
      <div style={{ marginBottom: 16 }}>
        <img src={logoImage} alt="Bridigix" style={{ width: 40, height: 40, objectFit: "contain" }} />
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: "#0A0A0A", marginBottom: 8 }}>
        We're on it.
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#6B6B6B", lineHeight: 1.65, maxWidth: 320 }}>
        Expect three matched profiles in your inbox within a week. We'll be in touch.
      </p>
      <motion.div
        style={{ width: "100%", maxWidth: 280, height: 3, background: "linear-gradient(90deg, #1A7A4A, #34D399)", borderRadius: 2, marginTop: 24 }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
      />
    </motion.div>
  );
}

function RecoveryBar({ onLoad, hidden }: { onLoad: (msgs: Message[]) => void; hidden: boolean; }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "not_found" | "error">("idle");
  const [toast, setToast] = useState(false);

  if (hidden) return null;

  const handleLoad = async () => {
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch(`/api/load-chat?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.messages) {
        onLoad(data.messages);
        setToast(true);
        setTimeout(() => setToast(false), 2500);
      } else {
        setState("not_found");
        setTimeout(() => setState("idle"), 2200);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  };

  return (
    <div style={{ background: "#F7F7F5", borderBottom: "1px solid #F0F0EE", padding: "10px 0", marginBottom: 8, borderRadius: 12 }}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6B6B", fontWeight: 400, whiteSpace: "nowrap" }}>
          Continue a previous chat?
        </span>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }}
          placeholder="your@email.com"
          style={{
            border: `1px solid ${state === "not_found" ? "#ef4444" : "#E8E8E8"}`,
            borderRadius: 6, padding: "5px 11px", fontSize: 12,
            fontFamily: "Inter, sans-serif", width: 200, outline: "none", transition: "border-color 0.2s",
            background: "white",
          }}
          onKeyDown={e => { if (e.key === "Enter") handleLoad(); }}
        />
        <button
          onClick={handleLoad}
          disabled={state === "loading"}
          style={{
            background: "#0A0A0A", color: "#FFFFFF", borderRadius: 6,
            padding: "5px 14px", fontSize: 12, fontFamily: "Inter, sans-serif",
            fontWeight: 500, cursor: "pointer", border: "none", transition: "background 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; }}
        >
          {state === "loading" ? "Loading..." : "Load"}
        </button>
        {state === "not_found" && (
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#ef4444" }}>No chat found for this email.</span>
        )}
      </div>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A7A4A" }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#1A7A4A" }}>Chat restored.</span>
        </motion.div>
      )}
    </div>
  );
}

export function ChatModal({ open, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestAiIndex, setLatestAiIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [sessionPhase, setSessionPhase] = useState<"init" | "continue_banner" | "chat">("init");
  const [savedMessages, setSavedMessages] = useState<Message[] | null>(null);
  const [recoveryBarHidden, setRecoveryBarHidden] = useState(false);
  const [greeting] = useState(() => getTimeGreeting());
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (!open) {
      setSessionPhase("init");
      setMessages([]);
      setComplete(false);
      setLatestAiIndex(-1);
      setDetectedEmail(null);
      setRecoveryBarHidden(false);
      setSavedMessages(null);
      setInput("");
      return;
    }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSavedMessages(parsed);
          setSessionPhase("continue_banner");
          return;
        }
      }
    } catch { /* ignore */ }
    startFresh();
  }, [open]);

  useEffect(() => {
    if (messages.length > 0 && sessionPhase === "chat") {
      try { localStorage.setItem(LS_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }
  }, [messages, sessionPhase]);

  useEffect(() => {
    if (messages.length === 0) return;
    const allText = messages.map(m => m.content).join(" ");
    const match = allText.match(EMAIL_REGEX);
    if (match && !detectedEmail) {
      setDetectedEmail(match[0]);
    }
  }, [messages, detectedEmail]);

  useEffect(() => {
    if (!detectedEmail || messages.length === 0) return;
    fetch("/api/save-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: detectedEmail, messages }),
    }).catch(() => {});
  }, [messages, detectedEmail]);

  function startFresh() {
    setMessages([]);
    setComplete(false);
    setLatestAiIndex(-1);
    setDetectedEmail(null);
    setRecoveryBarHidden(false);
    setSessionPhase("chat");
    setTimeout(() => {
      setMessages([{ role: "assistant", content: FIRST_MESSAGE }]);
      setLatestAiIndex(0);
    }, 400);
  }

  function continueSession() {
    if (!savedMessages) return;
    setMessages(savedMessages);
    setLatestAiIndex(-1);
    setSessionPhase("chat");
    setSavedMessages(null);
  }

  function handleEmailLoad(msgs: Message[]) {
    setMessages(msgs);
    setLatestAiIndex(-1);
    setSessionPhase("chat");
    setRecoveryBarHidden(true);
  }

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || complete) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "52px";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? "";

      if (reply === "INTAKE_COMPLETE") {
        const finalMsg = "Perfect. That's everything I need. I'm going into the network now — you'll have a handpicked shortlist in your inbox within a week. Keep an eye out.";
        setMessages(prev => {
          const u = [...prev, { role: "assistant" as const, content: finalMsg }];
          setLatestAiIndex(u.length - 1);
          return u;
        });
        setTimeout(() => {
          setComplete(true);
          try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
        }, 3000);
      } else {
        setMessages(prev => {
          const u = [...prev, { role: "assistant" as const, content: reply }];
          setLatestAiIndex(u.length - 1);
          return u;
        });
      }
    } catch {
      setMessages(prev => {
        const errMsg = "Sorry, something went wrong. Try again in a moment.";
        const u = [...prev, { role: "assistant" as const, content: errMsg }];
        setLatestAiIndex(u.length - 1);
        return u;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, complete]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "52px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const showNoConversation = sessionPhase === "chat" && messages.length === 0;
  const showRecovery = sessionPhase === "chat" && !recoveryBarHidden;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex flex-col"
          style={{ background: "#FAFAF8" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #1A7A4A, #34D399, #F5C518)", flexShrink: 0 }} />

          {/* Header */}
          <div
            className="flex-shrink-0"
            style={{ background: "rgba(250,250,248,0.97)", borderBottom: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}
          >
            <div className="max-w-[780px] mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "rgba(26,122,74,0.08)", border: "1px solid rgba(26,122,74,0.12)" }}>
                  <img src={logoImage} alt="Bridigix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#0A0A0A" }}>
                    Bridigix hiring partner
                  </span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B6B6B", marginLeft: 8 }}>
                    {loading ? "Thinking..." : "Online"}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: "#F0F0EE", border: "none", borderRadius: 8,
                  width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#6B6B6B", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E0E0DE"; e.currentTarget.style.color = "#0A0A0A"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F0F0EE"; e.currentTarget.style.color = "#6B6B6B"; }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Continue / Start Fresh Banner */}
          <AnimatePresence>
            {sessionPhase === "continue_banner" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.07)", flexShrink: 0 }}
              >
                <div className="max-w-[780px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15, color: "#0A0A0A", marginBottom: 2 }}>
                      You have an unfinished conversation
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6B6B" }}>
                      Want to pick up where you left off, or start fresh?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={continueSession}
                      style={{
                        background: "#0A0A0A", color: "white", border: "none",
                        borderRadius: 10, padding: "10px 22px", fontSize: 14,
                        fontFamily: "Inter, sans-serif", fontWeight: 500, cursor: "pointer", transition: "background 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A7A4A"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#0A0A0A"; }}
                    >
                      Continue
                    </button>
                    <button
                      onClick={startFresh}
                      style={{
                        background: "transparent", color: "#6B6B6B", border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 10, padding: "10px 22px", fontSize: 14,
                        fontFamily: "Inter, sans-serif", fontWeight: 400, cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)"; e.currentTarget.style.color = "#0A0A0A"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#6B6B6B"; }}
                    >
                      Start fresh
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
            <div className="max-w-[780px] mx-auto px-6 py-8 flex flex-col h-full">

              {/* Centered greeting when no messages */}
              {showNoConversation && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "clamp(32px, 5vw, 52px)",
                      color: "#0A0A0A",
                      letterSpacing: "-0.03em",
                      marginBottom: 16,
                      lineHeight: 1.1,
                    }}
                  >
                    {greeting}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 16,
                      color: "#6B6B6B",
                      fontWeight: 300,
                      maxWidth: 360,
                      lineHeight: 1.6,
                    }}
                  >
                    Tell us about your role and we'll find you the right engineer.
                  </motion.p>
                </div>
              )}

              {/* Recovery Bar */}
              {showRecovery && sessionPhase === "chat" && messages.length > 0 && (
                <RecoveryBar onLoad={handleEmailLoad} hidden={recoveryBarHidden} />
              )}

              {/* Greeting above first message */}
              {sessionPhase === "chat" && messages.length > 0 && messages.length <= 2 && (
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(28px, 4vw, 42px)",
                    color: "#0A0A0A",
                    letterSpacing: "-0.03em",
                    marginBottom: 32,
                    lineHeight: 1.15,
                    textAlign: "center",
                  }}
                >
                  {greeting}
                </motion.h1>
              )}

              {/* Messages */}
              <div className="flex flex-col gap-5">
                <button
                    onClick={toggleListening}
                    type="button"
                    style={{
                      width: 52, height: 52, borderRadius: 13, border: "none", flexShrink: 0,
                      background: isListening ? "linear-gradient(135deg, #E05050, #FF7070)" : "rgba(26,122,74,0.08)",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" stroke={isListening ? "white" : "#1A7A4A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" stroke={isListening ? "white" : "#1A7A4A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                {messages.map((msg, i) =>
                  msg.role === "assistant"
                    ? <AIBubble key={i} content={msg.content} isLatest={i === latestAiIndex} />
                    : <UserBubble key={i} content={msg.content} />
                )}
                {loading && <TypingDots />}
                {complete && <CompletionPanel />}
              </div>
              <div ref={messagesEndRef} style={{ height: 24 }} />
            </div>
          </div>

          {/* Input bar */}
          {sessionPhase === "chat" && !complete && (
            <div
              className="flex-shrink-0"
              style={{ background: "rgba(250,250,248,0.97)", borderTop: "1px solid rgba(0,0,0,0.07)", backdropFilter: "blur(12px)" }}
            >
              <div className="max-w-[780px] mx-auto px-6 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Reply..."
                    rows={1}
                    style={{
                      flex: 1, border: "1.5px solid #E4E4E2", borderRadius: 14, padding: "14px 18px",
                      fontFamily: "Inter, sans-serif", fontSize: 16, color: "#0A0A0A",
                      resize: "none", minHeight: 52, maxHeight: 140, overflowY: "auto",
                      outline: "none", transition: "border-color 0.2s", lineHeight: 1.5,
                      background: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onFocus={e => { e.target.style.borderColor = "#1A7A4A"; e.target.style.boxShadow = "0 0 0 3px rgba(26,122,74,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "#E4E4E2"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 52, height: 52, borderRadius: 13, border: "none", flexShrink: 0,
                      background: !input.trim() || loading ? "#E4E4E2" : "linear-gradient(135deg, #1A7A4A, #2A9D5C)",
                      cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: input.trim() && !loading ? "0 4px 14px rgba(26,122,74,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={!input.trim() || loading ? "#B0B0B0" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#B0B0B0", marginTop: 8, textAlign: "center" }}>
                  Bridigix hiring partner · Responses within seconds
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
