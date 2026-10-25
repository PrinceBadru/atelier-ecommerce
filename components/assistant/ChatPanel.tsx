"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  ShoppingBag,
  Check,
  ArrowRight,
} from "lucide-react";

interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl?: string;
  categoryName?: string;
  inStock?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductCardData[];
}

const SUGGESTED_PROMPTS = [
  "When will the ceramic tea bowl be in stock?",
  "Recommend a pour-over dripper for morning coffee",
  "When will the out of stock goods be available?",
  "Tell me about your Hinoki incense and aromatics",
];

export function ChatPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Atelier. I am your studio curator. Ask me about materials, craftsmanship, dimensions, or stock availability.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleAddToCart = async (product: ProductCardData) => {
    try {
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));

      // Dispatch custom cart event
      window.dispatchEvent(
        new CustomEvent("atelier:add-to-cart", {
          detail: {
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            imageUrl: product.imageUrl,
          },
        })
      );

      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 2500);
    } catch (err) {
      console.warn("Cart error:", err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Assistant response error");
      
      const contentType = res.headers.get("content-type") || "";
      let replyText = "";
      let matchedProducts: ProductCardData[] = [];

      if (contentType.includes("application/json")) {
        const json = await res.json();
        replyText = json.reply || "";
        matchedProducts = json.products || [];
      } else {
        replyText = await res.text();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: replyText,
          products: matchedProducts,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I apologize, but our workshop assistant is resting right now. You can continue browsing or using our hybrid search.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-elevation3 hover:bg-primary/90 transition-all duration-320 hover:scale-105"
        aria-label="Open AI Shopping Assistant"
      >
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium">Ask Assistant</span>
      </button>

      {/* Slide-out / Floating Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md h-[90vh] sm:h-[650px] bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-elevation3 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <header className="p-4 border-b border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-scale-16 font-semibold flex items-center gap-1.5">
                    Atelier Curator
                    <Badge variant="accent" className="text-[10px] py-0 px-1.5">
                      Grounded AI
                    </Badge>
                  </h3>
                  <span className="text-[11px] text-muted-foreground block">
                    Strictly referencing live workshop inventory
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-accent shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-3 max-w-[88%]">
                    <div
                      className={`rounded-xl p-3 leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none ml-auto"
                          : "bg-muted/50 border border-border text-foreground rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>

                    {/* Interactive Product Cards inside Assistant Stream */}
                    {m.products && m.products.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {m.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="rounded-lg border border-border bg-surface p-2.5 flex items-center gap-3 shadow-elevation1 hover:border-accent/40 transition-colors"
                          >
                            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                              <Image
                                src={
                                  prod.imageUrl ||
                                  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80"
                                }
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${prod.slug}`}
                                className="font-display font-medium text-[13px] text-foreground hover:text-accent truncate block"
                              >
                                {prod.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-xs text-foreground">
                                  {formatPrice(prod.priceCents)}
                                </span>
                                <Badge
                                  variant={prod.inStock ? "success" : "destructive"}
                                  className="text-[9px] py-0 px-1"
                                >
                                  {prod.inStock ? "In Stock" : "Sold Out"}
                                </Badge>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={addedIds[prod.id] ? "default" : "outline"}
                              disabled={!prod.inStock}
                              onClick={() => handleAddToCart(prod)}
                              className="text-[11px] h-8 px-2.5 shrink-0"
                            >
                              {addedIds[prod.id] ? (
                                <>
                                  <Check className="w-3 h-3 mr-1 text-success-foreground" />
                                  Added
                                </>
                              ) : !prod.inStock ? (
                                "Sold Out"
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 mr-1" /> Add
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-foreground shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span className="italic">Curator is consulting workshop archives...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-border/50 bg-background/50 flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] text-muted-foreground bg-surface border border-border rounded-full px-2.5 py-1 hover:border-accent hover:text-foreground text-left transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <footer className="p-3 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about materials, care, or stock..."
                  className="h-10 text-xs bg-surface"
                />
                <Button type="submit" size="icon" disabled={isThinking || !input.trim()} className="h-10 w-10 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="text-[10px] text-center text-muted-foreground mt-2">
                Grounded strictly in verified workshop database
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
