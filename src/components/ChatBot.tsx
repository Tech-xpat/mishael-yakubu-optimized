import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string; text: string}[]>([
    { role: "bot", text: "Hi, I'm Mishael's AI assistant. Ask me about web development, coaching, or Empire Digitals." }
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    // Placeholder response — replace with real AI endpoint later
    setTimeout(() => {
      setMessages(m => [...m, { role: "bot", text: "Thanks for your question. Mishael specializes in modern web apps, AI automation and tech coaching across Delta State. Reach out via WhatsApp for a full consultation." }]);
    }, 600);
  };

  return (
    <>
      <button 
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition"
      >
        {open ? <X /> : <MessageCircle />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          <div className="p-4 border-b font-medium">Ask Mishael AI</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <span className={`inline-block px-3 py-2 rounded-2xl ${m.role === "user" ? "bg-black text-white" : "bg-gray-100"}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type a message..." 
              className="flex-1 px-3 py-2 border rounded-full text-sm outline-none"
            />
            <button onClick={send} className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
