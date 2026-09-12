import { SquarePen, PanelLeftClose, MessageSquare, Trash2, ShieldCheck, HeartPulse, User, Star } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";

export default function Sidebar() {
    const {
        conversations,
        activeConversationId,
        isSidebarOpen,
        toggleSidebar,
        createNewChat,
        selectChat,
        deleteChat,
        openFeedbackModal,
        openAdmin,
    } = useChatStore();

    const { user, openAuthModal } = useAuthStore();

    if (!isSidebarOpen) return null;

    return (
        <aside className="
            fixed inset-y-0 left-0 z-40 flex w-64 flex-col 
            bg-[#171717] text-slate-200 border-r border-[#262626] 
            transition-all duration-300 md:static md:z-auto shrink-0
        ">
            {/* Top Bar: Logo & Sidebar Toggle */}
            <div className="flex h-14 items-center justify-between px-3 border-b border-[#262626]/50">
                <div 
                    onClick={createNewChat}
                    role="button"
                    title="ResQLink - Start new chat"
                    className="flex items-center gap-2.5 cursor-pointer select-none group py-1"
                >
                    <img 
                        src="/logo.png" 
                        alt="ResQLink Logo" 
                        className="h-8 w-8 rounded-lg object-cover shadow-sm ring-1 ring-white/10 group-hover:ring-cyan-400/50 transition-all" 
                    />
                    <span className="font-bold text-[15px] text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                        ResQLink
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={createNewChat}
                        title="New chat"
                        className="
                            flex h-8 w-8 items-center justify-center rounded-lg 
                            text-slate-400 hover:bg-[#212121] hover:text-cyan-400 
                            transition-colors
                        "
                    >
                        <SquarePen size={17} />
                    </button>
                    <button
                        onClick={toggleSidebar}
                        title="Close sidebar"
                        className="
                            flex h-8 w-8 items-center justify-center rounded-lg 
                            text-slate-400 hover:bg-[#212121] hover:text-slate-100 
                            transition-colors
                        "
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>
            </div>

            {/* Conversation History List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recent Chats
                </div>

                {conversations.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-slate-500 italic">
                        No previous chats. Start a new conversation!
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isActive = conv.id === activeConversationId;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => selectChat(conv.id)}
                                className={`
                                    group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 
                                    text-xs font-medium cursor-pointer transition-all duration-150
                                    ${isActive
                                        ? "bg-[#212121] text-white font-semibold"
                                        : "text-slate-300 hover:bg-[#212121]/70 hover:text-slate-100"
                                    }
                                `}
                            >
                                <MessageSquare size={15} className={`shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />

                                <span className="flex-1 truncate pr-5">
                                    {conv.title || "New Conversation"}
                                </span>

                                {/* Delete Action */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteChat(conv.id);
                                    }}
                                    title="Delete chat"
                                    className="
                                        absolute right-2 opacity-0 group-hover:opacity-100 
                                        p-1 text-slate-400 hover:text-red-400 transition-opacity
                                    "
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Section: Plan, Feedback & User Profile */}
            <div className="border-t border-[#262626] p-2 space-y-1">
                <button
                    type="button"
                    onClick={() => openFeedbackModal("MANUAL")}
                    className="
                        flex w-full items-center gap-3 rounded-lg px-3 py-2 
                        text-xs font-medium text-slate-300 
                        hover:bg-[#212121] hover:text-amber-300 transition-colors
                    "
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Star size={14} className="fill-amber-400" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">Rate & Review</span>
                        <span className="text-[10px] text-slate-400">Share your experience</span>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={openAdmin}
                    className="
                        flex w-full items-center gap-3 rounded-lg px-3 py-2 
                        text-xs font-medium text-slate-300 
                        hover:bg-[#212121] hover:text-cyan-300 transition-colors
                    "
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        <ShieldCheck size={14} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-100">Admin Dashboard</span>
                        <span className="text-[10px] text-slate-400">Tokens & Users Telemetry</span>
                    </div>
                </button>

                <div className="
                    flex items-center gap-3 rounded-lg px-3 py-2 
                    text-xs font-medium text-slate-200 
                    hover:bg-[#212121] cursor-pointer transition-colors
                ">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        <HeartPulse size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">Verified Patient Access</span>
                        <span className="text-[10px] text-slate-400">Clinical AI & Doctor Network</span>
                    </div>
                </div>

                <div 
                    onClick={() => {
                        if (!user) openAuthModal();
                    }}
                    className="
                        flex items-center justify-between rounded-lg px-3 py-2.5 
                        text-xs font-medium text-slate-200 hover:bg-[#212121] cursor-pointer transition-colors
                    "
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={14} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-slate-200 truncate">
                                {user ? user.displayName : "Sign In to ResQLink"}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                                {user ? user.email : "Quick Google/Email Sign-up"}
                            </span>
                        </div>
                    </div>
                    <HeartPulse size={16} className="text-cyan-400 shrink-0" />
                </div>
            </div>
        </aside>
    );
}
