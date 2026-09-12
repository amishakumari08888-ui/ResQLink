import { useState } from "react";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, Stethoscope, Pill, Leaf, AlertTriangle, Activity, Maximize2, X } from "lucide-react";
import { type Message } from "../types/Message";
import { useChatStore } from "../store/chatStore";

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { regenerateLastResponse } = useChatStore();

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Format assistant text with headers, cards, and bold text
    const renderFormattedContent = (content: string) => {
        if (isUser) {
            return <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{content}</p>;
        }

        const blocks = content.split(/\n(?=###|\*\*|•|-|\d+\.)/);

        return (
            <div className="space-y-4 text-[15px] leading-7 text-slate-100 font-normal">
                {blocks.map((block, idx) => {
                    const trimmed = block.trim();
                    if (!trimmed) return null;

                    // Section Headings (Medical Triage Sections)
                    if (trimmed.startsWith("###") || trimmed.includes("🩺") || trimmed.includes("👨‍⚕️") || trimmed.includes("💊") || trimmed.includes("🌿") || trimmed.includes("⚠️")) {
                        let headerBg = "from-cyan-950/60 to-slate-900/90 border-cyan-500/30 text-cyan-300";
                        let Icon = Activity;

                        if (trimmed.includes("Doctor") || trimmed.includes("👨‍⚕️")) {
                            headerBg = "from-blue-950/70 to-slate-900/90 border-blue-500/40 text-blue-300";
                            Icon = Stethoscope;
                        } else if (trimmed.includes("OTC") || trimmed.includes("Medicines") || trimmed.includes("💊")) {
                            headerBg = "from-purple-950/70 to-slate-900/90 border-purple-500/40 text-purple-300";
                            Icon = Pill;
                        } else if (trimmed.includes("Home") || trimmed.includes("Remedies") || trimmed.includes("🌿")) {
                            headerBg = "from-emerald-950/70 to-slate-900/90 border-emerald-500/40 text-emerald-300";
                            Icon = Leaf;
                        } else if (trimmed.includes("Red Flag") || trimmed.includes("Warning") || trimmed.includes("⚠️")) {
                            headerBg = "from-red-950/80 to-slate-900/90 border-red-500/50 text-red-300";
                            Icon = AlertTriangle;
                        }

                        const titleText = trimmed.replace(/^###\s*/, "").replace(/[🩺👨‍⚕️💊🌿⚠️]/g, "").trim();

                        return (
                            <div key={idx} className={`my-3 flex items-center gap-2.5 rounded-xl bg-gradient-to-r ${headerBg} border px-4 py-2 font-semibold shadow-md`}>
                                <Icon size={18} className="shrink-0" />
                                <span>{titleText}</span>
                            </div>
                        );
                    }

                    // Doctor Card styling if line contains doctor info
                    if (trimmed.includes("Dr.") && (trimmed.includes("Specialty:") || trimmed.includes("Hospital:") || trimmed.includes("Contact:") || trimmed.includes("Fee:"))) {
                        return (
                            <div key={idx} className="my-2 rounded-2xl border border-cyan-500/30 bg-[#25262b] p-4 shadow-lg">
                                {formatTextWithBold(trimmed)}
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className="leading-7 font-normal">
                            {formatTextWithBold(trimmed)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const formatTextWithBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className="font-semibold text-white">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="w-full py-3">
            {/* Image Full Size Lightbox Modal */}
            {isModalOpen && message.image && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-[#1e1e1e] p-2 border border-slate-700 shadow-2xl">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModalOpen(false);
                            }}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-slate-300 hover:bg-black/95 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <img
                            src={message.image}
                            alt="Full size medical attachment"
                            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {isUser ? (
                /* ChatGPT User Bubble */
                <div className="flex justify-end">
                    <div className="
                        max-w-[85%] sm:max-w-[75%] rounded-[24px] px-5 py-3.5 
                        bg-[#2f2f2f] text-slate-100 shadow-md border border-[#3a3a3a]
                    ">
                        {message.image && (
                            <div className="mb-2.5">
                                <div 
                                    onClick={() => setIsModalOpen(true)}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 bg-black/40 hover:opacity-95 transition-all max-w-sm"
                                >
                                    <img
                                        src={message.image}
                                        alt="Uploaded attachment"
                                        className="max-h-60 w-auto rounded-xl object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-medium text-white">
                                        <Maximize2 size={16} />
                                        <span>Click to enlarge</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {message.content && renderFormattedContent(message.content)}
                    </div>
                </div>
            ) : (
                /* ChatGPT Assistant Stream Response */
                <div className="max-w-full space-y-2 overflow-hidden">
                    {/* Message Header */}
                    <div className="text-[13px] font-semibold text-slate-300">
                        
                    </div>

                        <div>
                            {renderFormattedContent(message.content)}
                        </div>

                        {/* ChatGPT Response Action Toolbar */}
                        <div className="flex items-center gap-1 pt-2 text-slate-400">
                            <button
                                onClick={handleCopy}
                                title={copied ? "Copied!" : "Copy message"}
                                className="
                                    flex items-center gap-1 rounded-md p-1.5 
                                    text-xs hover:bg-[#2f2f2f] hover:text-slate-200 transition-colors
                                "
                            >
                                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                                {copied && <span className="text-[11px] text-emerald-400">Copied</span>}
                            </button>

                            <button
                                onClick={() => regenerateLastResponse()}
                                title="Regenerate response"
                                className="
                                    flex items-center gap-1 rounded-md p-1.5 
                                    text-xs hover:bg-[#2f2f2f] hover:text-slate-200 transition-colors
                                "
                            >
                                <RotateCcw size={15} />
                            </button>

                            <button
                                onClick={() => setFeedback(feedback === "up" ? null : "up")}
                                title="Good response"
                                className={`
                                    rounded-md p-1.5 hover:bg-[#2f2f2f] transition-colors
                                    ${feedback === "up" ? "text-emerald-400" : "hover:text-slate-200"}
                                `}
                            >
                                <ThumbsUp size={15} />
                            </button>

                            <button
                                onClick={() => setFeedback(feedback === "down" ? null : "down")}
                                title="Bad response"
                                className={`
                                    rounded-md p-1.5 hover:bg-[#2f2f2f] transition-colors
                                    ${feedback === "down" ? "text-red-400" : "hover:text-slate-200"}
                                `}
                            >
                                <ThumbsDown size={15} />
                            </button>
                        </div>
                    </div>
            )}
        </div>
    );
}
