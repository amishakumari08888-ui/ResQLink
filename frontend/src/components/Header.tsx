import { useState, useEffect } from "react";
import {
    PanelLeft,
    SquarePen,
    ChevronDown,
    Sparkles,
    Zap,
    HeartPulse,
    LogIn,
    LogOut,
    Star,
} from "lucide-react";

import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { type AiModel } from "../types/Chat";
import {
    fetchUsageStatus,
    type UsageStatusResponse,
} from "../api/feedbackApi";

import AuthModal from "./AuthModal";
import FeedbackModal from "./FeedbackModal";

export default function Header() {
    const {
        isSidebarOpen,
        toggleSidebar,
        createNewChat,
        selectedModel,
        setSelectedModel,
        isFeedbackModalOpen,
        feedbackTriggerReason,
        openFeedbackModal,
        closeFeedbackModal,
    } = useChatStore();

    const { user, openAuthModal, logout } = useAuthStore();

    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [usage, setUsage] = useState<UsageStatusResponse | null>(null);

    // --------------------------------------------------
    // Fetch live usage status
    // --------------------------------------------------
    useEffect(() => {
        const loadUsage = async () => {
            try {
                const uid = user?.uid || "anonymous-patient";

                const data = await fetchUsageStatus(uid);

                setUsage(data);
            } catch {
                // Ignore usage fetch error
            }
        };

        loadUsage();

        const interval = setInterval(loadUsage, 15000);

        return () => clearInterval(interval);
    }, [user]);

    // --------------------------------------------------
    // Available AI Models
    // --------------------------------------------------
    const models: {
        id: AiModel;
        name: string;
        desc: string;
        icon: typeof Sparkles;
    }[] = [
            {
                id: "nexcure-3.4",
                name: "emma v3.4",
                desc: "Full medical triage, doctor matching & OTC guidance",
                icon: Sparkles,
            },
            {
                id: "doctor-triage",
                name: "emma Clinical",
                desc: "Verified doctor matching and specialist triage",
                icon: HeartPulse,
            },
            {
                id: "emergency-fast",
                name: "emma Pro",
                desc: "Fast emergency & symptom severity check",
                icon: Zap,
            },
        ];

    const currentModelInfo =
        models.find((m) => m.id === selectedModel) || models[0];

    return (
        <>
            {/* =========================================================
                HEADER
            ========================================================= */}
            <header
                className="
                    sticky top-0 z-30
                    flex h-14 w-full items-center justify-between
                    bg-[#212121]
                    px-3 sm:px-3.5
                    border-b border-[#2f2f2f]
                    text-slate-200
                "
            >
                {/* =====================================================
                    LEFT SIDE
                ===================================================== */}
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

                    {/* -------------------------------------------------
                        Sidebar + New Chat
                    ------------------------------------------------- */}
                    {!isSidebarOpen && (
                        <>
                            {/* Sidebar button
                                Visible on both desktop and phone
                            */}
                            <button
                                onClick={toggleSidebar}
                                title="Open sidebar"
                                aria-label="Open sidebar"
                                className="
                                    flex h-9 w-9 shrink-0
                                    items-center justify-center
                                    rounded-lg
                                    text-slate-300
                                    hover:bg-[#2f2f2f]
                                    hover:text-white
                                    transition-colors
                                "
                            >
                                <PanelLeft size={19} />
                            </button>

                            {/* New Chat
                                DESKTOP ONLY
                            */}
                            <button
                                onClick={createNewChat}
                                title="New chat"
                                aria-label="New chat"
                                className="
                                    hidden md:flex
                                    h-9 w-9 shrink-0
                                    items-center justify-center
                                    rounded-lg
                                    text-slate-300
                                    hover:bg-[#2f2f2f]
                                    hover:text-white
                                    transition-colors
                                "
                            >
                                <SquarePen size={19} />
                            </button>
                        </>
                    )}

                    {/* -------------------------------------------------
                        ResQLink Brand

                        DESKTOP ONLY

                        hidden  = phone
                        md:flex = tablet/desktop
                    ------------------------------------------------- */}
                    <div
                        onClick={createNewChat}
                        role="button"
                        tabIndex={0}
                        title="ResQLink - Start new chat"
                        aria-label="ResQLink - Start new chat"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                createNewChat();
                            }
                        }}
                        className="
                            hidden md:flex
                            items-center gap-2
                            px-1.5 py-1
                            rounded-xl
                            cursor-pointer
                            select-none
                            hover:bg-[#2a2a2a]
                            transition-colors
                            group
                            mr-1
                        "
                    >
                        <img
                            src="/logo.png"
                            alt="ResQLink Logo"
                            className="
                                h-8 w-8
                                rounded-lg
                                object-cover
                                shadow-sm
                                ring-1 ring-white/10
                                group-hover:ring-cyan-400/50
                                transition-all
                            "
                        />

                        <span
                            className="
                                font-bold
                                text-[15px]
                                tracking-tight
                                text-white
                                group-hover:text-cyan-300
                                transition-colors
                            "
                        >
                            ResQLink
                        </span>
                    </div>

                    {/* =================================================
                        MODEL DROPDOWN
                    ================================================= */}
                    <div className="relative min-w-0">
                        <button
                            onClick={() =>
                                setIsModelDropdownOpen(
                                    !isModelDropdownOpen
                                )
                            }
                            aria-haspopup="menu"
                            aria-expanded={isModelDropdownOpen}
                            className="
                                flex
                                max-w-[150px]
                                sm:max-w-none
                                items-center
                                gap-1.5
                                rounded-xl
                                px-2.5 sm:px-3
                                py-1.5
                                text-sm
                                font-semibold
                                hover:bg-[#2f2f2f]
                                transition-colors
                                text-slate-200
                                hover:text-white
                            "
                        >
                            <span className="truncate">
                                {currentModelInfo.name}
                            </span>

                            <ChevronDown
                                size={14}
                                className="
                                    shrink-0
                                    text-slate-400
                                "
                            />
                        </button>

                        {/* -------------------------------------------------
                            Model Dropdown Menu
                        ------------------------------------------------- */}
                        {isModelDropdownOpen && (
                            <>
                                {/* Click outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() =>
                                        setIsModelDropdownOpen(false)
                                    }
                                />

                                <div
                                    className="
                                        absolute
                                        left-0
                                        top-full
                                        mt-2
                                        z-50

                                        w-[calc(100vw-24px)]
                                        max-w-72

                                        rounded-2xl
                                        border border-[#383838]
                                        bg-[#212121]
                                        p-1.5
                                        shadow-2xl
                                        backdrop-blur-2xl

                                        animate-in
                                        fade-in
                                        zoom-in-95
                                        duration-150
                                    "
                                >
                                    <div
                                        className="
                                            px-3 py-2
                                            text-[11px]
                                            font-semibold
                                            text-slate-400
                                            uppercase
                                            tracking-wider
                                        "
                                    >
                                        Model Selection
                                    </div>

                                    {models.map((m) => {
                                        const Icon = m.icon;

                                        const isSelected =
                                            m.id === selectedModel;

                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => {
                                                    setSelectedModel(m.id);

                                                    setIsModelDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className={`
                                                    flex
                                                    w-full
                                                    items-start
                                                    gap-3
                                                    rounded-xl
                                                    p-2.5
                                                    text-left
                                                    transition-all

                                                    ${isSelected
                                                        ? "bg-[#2f2f2f] text-white"
                                                        : "text-slate-300 hover:bg-[#2a2a2a]"
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    size={18}
                                                    className={`
                                                        mt-0.5
                                                        shrink-0

                                                        ${isSelected
                                                            ? "text-cyan-400"
                                                            : "text-slate-400"
                                                        }
                                                    `}
                                                />

                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold">
                                                        {m.name}
                                                    </div>

                                                    <div
                                                        className="
                                                            mt-0.5
                                                            text-[11px]
                                                            leading-tight
                                                            text-slate-400
                                                        "
                                                    >
                                                        {m.desc}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    RIGHT SIDE
                ===================================================== */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

                    {/* -------------------------------------------------
                        Live Usage

                        DESKTOP / TABLET ONLY
                    ------------------------------------------------- */}
                    {usage && (
                        <div
                            title={`Daily Limit: ${usage.promptLimit} prompts / ${usage.inputTokenLimit} tokens`}
                            className="
                                hidden md:flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border border-[#383838]
                                bg-[#282828]
                                px-2.5
                                py-1
                                text-[11px]
                                font-medium
                                text-slate-300
                            "
                        >
                            <span
                                className="
                                    h-1.5 w-1.5
                                    rounded-full
                                    bg-cyan-400
                                    animate-pulse
                                "
                            />

                            <span>
                                {usage.promptsUsed}/
                                {usage.promptLimit} prompts
                            </span>
                        </div>
                    )}


                    {/* -------------------------------------------------
                        Feedback Button
                    ------------------------------------------------- */}
                    <button
                        onClick={() =>
                            openFeedbackModal("MANUAL")
                        }
                        title="Give Feedback & Review"
                        aria-label="Give Feedback & Review"
                        className="
                            flex
                            items-center
                            gap-1.5
                            rounded-lg
                            px-2 sm:px-2.5
                            py-1.5
                            text-xs
                            font-medium
                            text-amber-400/90
                            hover:bg-amber-400/10
                            hover:text-amber-300
                            transition-colors
                            border
                            border-amber-500/20
                        "
                    >
                        <Star
                            size={14}
                            className="
                                fill-amber-400
                                text-amber-400
                                shrink-0
                            "
                        />

                        <span className="hidden sm:inline">
                            Feedback
                        </span>
                    </button>

                    {/* =================================================
                        USER AUTH
                    ================================================= */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsUserDropdownOpen(
                                        !isUserDropdownOpen
                                    )
                                }
                                aria-haspopup="menu"
                                aria-expanded={isUserDropdownOpen}
                                className="
                                    flex
                                    items-center
                                    gap-1.5 sm:gap-2
                                    rounded-xl
                                    border border-[#3a3a3a]
                                    bg-[#292929]
                                    px-1.5 sm:px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    text-slate-200
                                    hover:bg-[#333333]
                                    transition-colors
                                "
                            >
                                {/* User Avatar */}
                                <div
                                    className="
                                        flex
                                        h-6 w-6
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-cyan-600
                                        text-white
                                        font-bold
                                        text-[10px]
                                    "
                                >
                                    {user.displayName
                                        ? user.displayName
                                            .charAt(0)
                                            .toUpperCase()
                                        : "U"}
                                </div>

                                {/* Username
                                    Desktop only
                                */}
                                <span
                                    className="
                                        hidden md:inline
                                        max-w-[100px]
                                        truncate
                                    "
                                >
                                    {user.displayName}
                                </span>

                                <ChevronDown
                                    size={12}
                                    className="
                                        shrink-0
                                        text-slate-400
                                    "
                                />
                            </button>

                            {/* -------------------------------------------------
                                User Dropdown
                            ------------------------------------------------- */}
                            {isUserDropdownOpen && (
                                <>
                                    {/* Click outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() =>
                                            setIsUserDropdownOpen(
                                                false
                                            )
                                        }
                                    />

                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-full
                                            mt-2
                                            z-50

                                            w-60

                                            rounded-2xl
                                            border border-[#383838]
                                            bg-[#222222]
                                            p-2
                                            shadow-2xl

                                            animate-in
                                            fade-in
                                        "
                                    >
                                        {/* User Info */}
                                        <div
                                            className="
                                                px-3 py-2
                                                border-b
                                                border-[#2e2e2e]
                                            "
                                        >
                                            <div
                                                className="
                                                    text-xs
                                                    font-semibold
                                                    text-white
                                                    truncate
                                                "
                                            >
                                                {user.displayName}
                                            </div>

                                            <div
                                                className="
                                                    text-[11px]
                                                    text-slate-400
                                                    truncate
                                                "
                                            >
                                                {user.email}
                                            </div>
                                        </div>

                                        {/* Usage Info */}
                                        <div
                                            className="
                                                px-3 py-2
                                                text-[11px]
                                                text-slate-400
                                            "
                                        >
                                            Daily Limit:{" "}
                                            <strong className="text-cyan-300">
                                                8 Prompts / 1,200 Tokens
                                            </strong>
                                        </div>


                                        {/* Feedback */}
                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(
                                                    false
                                                );

                                                openFeedbackModal(
                                                    "MANUAL"
                                                );
                                            }}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-2
                                                rounded-xl
                                                p-2
                                                text-xs
                                                text-amber-300
                                                hover:bg-[#2c2c2c]
                                                transition-colors
                                            "
                                        >
                                            <Star
                                                size={14}
                                                className="fill-amber-400"
                                            />

                                            <span>
                                                Leave Feedback
                                            </span>
                                        </button>

                                        {/* Sign Out */}
                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(
                                                    false
                                                );

                                                logout();
                                            }}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-2
                                                rounded-xl
                                                p-2
                                                text-xs
                                                text-red-400
                                                hover:bg-[#2c2c2c]
                                                transition-colors
                                            "
                                        >
                                            <LogOut size={14} />

                                            <span>
                                                Sign Out
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* -------------------------------------------------
                            Sign In
                        ------------------------------------------------- */
                        <button
                            onClick={openAuthModal}
                            title="Sign In"
                            className="
                                flex
                                items-center
                                gap-1.5
                                rounded-xl
                                bg-cyan-500
                                px-2.5 sm:px-3
                                py-1.5
                                text-xs
                                font-bold
                                text-black
                                shadow-md
                                shadow-cyan-500/20
                                hover:bg-cyan-400
                                transition-all
                                active:scale-[0.98]
                            "
                        >
                            <LogIn
                                size={14}
                                className="shrink-0"
                            />

                            <span className="hidden sm:inline">
                                Sign In
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* =========================================================
                GLOBAL MODALS
            ========================================================= */}
            <AuthModal />

            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={closeFeedbackModal}
                triggerReason={feedbackTriggerReason}
            />
        </>
    );
}