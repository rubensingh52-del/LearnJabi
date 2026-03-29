import { useQuery, useMutation } from "@tanstack/react-query";
import { type ChatMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const suggestions = [
  "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! Teach me basic greetings",
  "How do I introduce myself in Punjabi?",
  "What are the Punjabi numbers 1-10?",
  "Tell me about Punjabi food culture",
  "How do I say 'Thank you' in Punjabi?",
  "Explain the Gurmukhi alphabet",
];

export default function Tutor() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({ queryKey: ["/api/chat"] });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/chat");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || sendMutation.isPending) return;
    setInput("");
    // Optimistically add user message
    queryClient.setQueryData<ChatMessage[]>(["/api/chat"], old => [
      ...(old || []),
      { id: Date.now(), role: "user", content, timestamp: new Date().toISOString() },
    ]);
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-border/60 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold" data-testid="text-tutor-title">Guru — AI Punjabi Tutor</h1>
              <p className="text-xs text-muted-foreground">Ask anything about Punjabi language and culture</p>
            </div>
          </div>
          {hasMessages && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              data-testid="button-clear-chat"
              aria-label="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          {!hasMessages && !isLoading ? (
            // Empty state
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-base font-bold mb-1" data-testid="text-tutor-empty">ਸਤ ਸ੍ਰੀ ਅਕਾਲ!</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                I'm Guru, your AI Punjabi tutor. Ask me anything — vocabulary, grammar, pronunciation, or Punjabi culture. I'm here to help you learn.
              </p>

              <div className="grid gap-2 sm:grid-cols-2 w-full max-w-lg">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="text-left p-3 rounded-lg border border-border/60 text-xs hover:border-primary/30 transition-colors"
                    data-testid={`button-suggestion-${i}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Message list
            <div className="space-y-4">
              {messages?.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${msg.role}-${msg.id}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-card-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted flex items-center justify-center mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {sendMutation.isPending && (
                <div className="flex gap-3" data-testid="message-loading">
                  <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Guru is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border/60 px-4 sm:px-6 py-3 bg-background">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
