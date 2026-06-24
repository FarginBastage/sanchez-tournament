import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import type { Member, Message } from "@shared/schema";
import { Send } from "lucide-react";

const MEMBER_COLORS: Record<string, string> = {
  roshi:  "#e65100", goku: "#f57f17", gohan: "#2e7d32", bulma: "#7b1fa2"
};

const CHAR_BG: Record<string, string> = {
  roshi:  "bg-orange-900", goku: "bg-amber-800", gohan: "bg-green-900", bulma: "bg-purple-900"
};

export default function ChatPage() {
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: members = [] } = useQuery<Member[]>({ queryKey: ["/api/members"] });
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: (content: string) => {
      if (!activeMemberId) throw new Error("No member selected");
      return apiRequest("POST", "/api/messages", {
        memberId: activeMemberId,
        content,
        timestamp: new Date().toISOString(),
      }).then(r => r.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
  });

  const handleSend = () => {
    if (!message.trim() || !activeMemberId) return;
    sendMessage.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMember = (id: number) => members.find(m => m.id === id);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const formatFullTimestamp = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) {
      return `Today at ${formatTime(ts)}`;
    }
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${formatTime(ts)}`;
  };

  // Group messages by date for separators
  const getDayKey = (ts: string) => new Date(ts).toDateString();

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <h1 className="text-base font-black text-foreground">War Room</h1>
        <p className="text-xs text-muted-foreground">Family group chat</p>
      </div>

      {/* Member selector */}
      <div className="border-b border-border bg-card/50 px-4 py-2 flex gap-2 flex-wrap flex-shrink-0">
        <span className="text-xs text-muted-foreground self-center">Chatting as:</span>
        {members.map(m => (
          <button
            key={m.id}
            data-testid={`select-member-${m.id}`}
            onClick={() => setActiveMemberId(m.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-all border ${activeMemberId === m.id ? "text-white border-transparent shadow-sm" : "bg-transparent border-border text-muted-foreground hover:bg-muted"}`}
            style={activeMemberId === m.id ? { backgroundColor: MEMBER_COLORS[m.character] } : {}}
          >
            <span>{m.emoji}</span>
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="text-center text-muted-foreground text-sm py-8">Loading war room...</div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p className="text-2xl mb-2">💬</p>
            <p>No messages yet. Start the battle talk!</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const member = getMember(msg.memberId);
          if (!member) return null;
          const isMe = member.id === activeMemberId;
          const color = MEMBER_COLORS[member.character] || "#888";
          const isNoteMsg = msg.content.startsWith("📝");

          // Date separator: show when day changes
          const prevMsg = messages[idx - 1];
          const showDateSep = !prevMsg || getDayKey(prevMsg.timestamp) !== getDayKey(msg.timestamp);

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDateSep && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">
                    {formatDate(msg.timestamp)}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
              )}

              {/* Note messages — centered system-style */}
              {isNoteMsg ? (
                <div data-testid={`message-${msg.id}`} className="flex justify-center my-1">
                  <div className="max-w-[85%] rounded-xl px-4 py-2.5 text-sm border"
                    style={{ backgroundColor: color + "18", borderColor: color + "40" }}>
                    <div className="whitespace-pre-wrap" style={{ color }}>
                      {msg.content}
                    </div>
                    <div className="text-[10px] text-muted-foreground/50 mt-1 text-right">
                      {formatFullTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular chat bubble */
                <div data-testid={`message-${msg.id}`}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: color + "33" }}>
                    {member.emoji}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    <div className={`text-xs text-muted-foreground ${isMe ? "text-right" : ""}`}>
                      {member.name}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"} text-white`}
                      style={{ backgroundColor: isMe ? color : color + "99" }}
                    >
                      {msg.content}
                    </div>
                    <div className={`text-[11px] text-muted-foreground/60 ${isMe ? "text-right" : ""}`}>
                      {formatFullTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 flex gap-2 flex-shrink-0">
        {!activeMemberId && (
          <div className="flex-1 text-sm text-muted-foreground italic self-center">
            Select who you are above to chat
          </div>
        )}
        {activeMemberId && (
          <>
            <textarea
              data-testid="input-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              data-testid="btn-send"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ backgroundColor: MEMBER_COLORS[members.find(m => m.id === activeMemberId)?.character || ""] || "#888" }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
