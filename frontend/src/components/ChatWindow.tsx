import { useEffect, useRef } from "react";
import { Stethoscope, Pill, Leaf, Activity, Lock, LogIn } from "lucide-react";
import { type Message } from "../types/Message";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useAuthStore } from "../store/authStore";

interface Props {
    messages: Message[];
    loading: boolean;
    onSend?: (message: string) => void;
}

const suggestions = [
    {
        icon: Stethoscope,
        title: "Recommend a Specialist Doctor",
        prompt: "Can you recommend a specialist doctor from your database for persistent joint pain and stiffness?",
        iconColor: "text-cyan-400",
    },
    {
        icon: Pill,
        title: "OTC Medicine Advice",
        prompt: "What over-the-counter (OTC) medicines can I take for a mild headache and minor fever?",
        iconColor: "text-purple-400",
    },
    {
        icon: Leaf,
        title: "Home Remedies for Cold",
        prompt: "What basic home remedies do you suggest for a mild seasonal cold and sore throat?",
        iconColor: "text-emerald-400",
    },
    {
        icon: Activity,
        title: "Assess Symptoms & Rash",
        prompt: "I have had a mild skin rash and slight indigestion for 2 days. What should I do?",
        iconColor: "text-rose-400",
    },
];

export default function ChatWindow({ messages, loading, onSend }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const { user, openAuthModal } = useAuthStore();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    const handlePromptClick = (prompt: string) => {
        if (!user) {
            openAuthModal();
            return;
        }
        if (onSend) {
            onSend(prompt);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#212121] px-4 py-6 text-slate-100">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-between">

                {messages.length === 0 ? (
                    /* ChatGPT Style Welcome Screen */
                    <div className="my-auto flex flex-col items-center justify-center text-center py-8 sm:py-12">

                        <div className="relative mb-5 group">
                            <img 
                                src="/logo.png" 
                                alt="ResQLink Logo" 
                                className="h-20 w-20 rounded-2xl object-cover shadow-xl ring-2 ring-cyan-500/30 group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                            What medical assistance do you need today?
                        </h1>

                        <p className="mt-2.5 max-w-md text-sm text-slate-400 leading-relaxed">
                            Describe your symptoms to get verified <strong>Doctor Recommendations</strong>, safe <strong>OTC medicine guidance</strong>, or <strong>Home Remedies</strong>.
                        </p>

                        {/* Force Login Banner when Unauthenticated */}
                        {!user && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 p-4 text-left max-w-lg shadow-lg">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                                    <Lock size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Authentication Required</h4>
                                    <p className="text-xs text-slate-300 mt-0.5">Please sign in to begin clinical triage, chat with Emma, and store medical feedback.</p>
                                </div>
                                <button
                                    onClick={openAuthModal}
                                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-md hover:bg-cyan-400 transition-all shrink-0"
                                >
                                    <LogIn size={14} />
                                    <span>Sign In</span>
                                </button>
                            </div>
                        )}

                        {/* ChatGPT Prompt Card Grid */}
                        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                            {suggestions.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.title}
                                        onClick={() => handlePromptClick(item.prompt)}
                                        className="
                                            group flex flex-col justify-between text-left 
                                            rounded-2xl border border-[#363636] bg-[#2a2a2a] 
                                            p-4 transition-all duration-200 
                                            hover:border-[#4a4a4a] hover:bg-[#323232] 
                                            active:scale-[0.99] shadow-sm
                                        "
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-200 text-sm group-hover:text-white">
                                                {item.title}
                                            </span>
                                            <Icon size={18} className={`${item.iconColor} shrink-0`} />
                                        </div>

                                        <span className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                            {item.prompt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Active Conversation Messages */
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {loading && <TypingIndicator />}

                        <div ref={bottomRef} />
                    </div>
                )}

            </div>
        </div>
    );
}
