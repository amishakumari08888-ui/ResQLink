import { X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loading, syncing, error, clearError } = useAuthStore();

    if (!isAuthModalOpen) return null;

    const handleGoogleLogin = async () => {
        clearError();
        try {
            await loginWithGoogle();
        } catch {
            // Error handled in store
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
            onClick={closeAuthModal}
        >
            <div 
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#3a3a3a] bg-[#222222] p-6 text-slate-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-[#2f2f2f] hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <img 
                        src="/logo.png" 
                        alt="ResQLink Logo" 
                        className="mb-3 h-14 w-14 rounded-2xl object-cover shadow-lg ring-1 ring-white/20"
                    />
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        Sign In to ResQLink
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                        Sign in with Google to access clinical triage, consult verified doctors, and store your session in PostgreSQL.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-300">
                        <AlertCircle size={16} className="shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign-In */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || syncing}
                    className="
                        flex w-full items-center justify-center gap-3 rounded-2xl 
                        border border-[#444] bg-[#2c2c2c] px-4 py-3.5 text-sm font-semibold 
                        text-slate-100 shadow-sm transition-all hover:bg-[#353535] 
                        hover:border-slate-400 active:scale-[0.99] disabled:opacity-50
                    "
                >
                    {loading || syncing ? (
                        <>
                            <Loader2 size={18} className="animate-spin text-cyan-400" />
                            <span>
                                {syncing ? "Saving to PostgreSQL database..." : "Signing in with Google..."}
                            </span>
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 size={13} className="text-cyan-400" />
                    <span>PostgreSQL database sync enabled</span>
                </div>
            </div>
        </div>
    );
}
