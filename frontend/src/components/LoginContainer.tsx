import { 
    HeartPulse, 
    ShieldCheck, 
    Database, 
    Stethoscope, 
    AlertCircle, 
    Loader2, 
    CheckCircle2
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function LoginContainer() {
    const { loginWithGoogle, loading, syncing, error, clearError } = useAuthStore();

    const handleGoogleLogin = async () => {
        clearError();
        try {
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google sign-in error:", err);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-[#171717] px-4 py-8 text-slate-100 selection:bg-cyan-500 selection:text-black">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#303030] bg-[#222222]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                
                {/* Brand & Logo Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/20">
                        <img 
                            src="/logo.png" 
                            alt="ResQLink Logo" 
                            className="h-full w-full rounded-[14px] object-cover"
                        />
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                        <HeartPulse size={13} className="text-cyan-400" />
                        <span>ResQLink Clinical AI</span>
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
                        Welcome to ResQLink
                    </h1>
                    
                    <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-sm">
                        Access instant AI medical triage, verify symptoms, and connect with certified specialist doctors.
                    </p>
                </div>

                {/* Authentication Gate Notice */}
                <div className="my-6 rounded-2xl border border-[#333333] bg-[#1a1a1a] p-3.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                        <Database size={16} className="mt-0.5 text-cyan-400 shrink-0" />
                        <div className="leading-snug">
                            <span className="font-semibold text-white">PostgreSQL Verified Access:</span>
                            <span className="text-slate-400 ml-1">
                                Sign in with your Google account to create or resume your secure clinical session. Unauthenticated access to the chatbot is restricted.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 flex flex-col gap-1 rounded-2xl border border-red-500/40 bg-red-950/80 p-3.5 text-xs text-red-200 animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-400 shrink-0" />
                            <span className="font-semibold text-red-100">Sign-in Required</span>
                        </div>
                        <p className="text-[11px] text-red-300 leading-normal pl-6">
                            {error}
                        </p>
                    </div>
                )}

                {/* Direct Google OAuth Login Button */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading || syncing}
                        className="
                            group relative flex w-full items-center justify-center gap-3 
                            rounded-2xl border border-[#444] bg-[#2c2c2c] px-5 py-3.5 
                            text-sm font-semibold text-white shadow-lg transition-all 
                            hover:bg-[#353535] hover:border-cyan-500/50 hover:shadow-cyan-500/10 
                            active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        {loading || syncing ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-cyan-400" />
                                <span>
                                    {syncing ? "Saving to Supabase PostgreSQL..." : "Connecting to Google..."}
                                </span>
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <CheckCircle2 size={13} className="text-cyan-400" />
                        <span>Google-only authentication • Verified via Supabase PostgreSQL</span>
                    </div>
                </div>

                {/* Features & Trust Badges */}
                <div className="mt-8 border-t border-[#333] pt-5">
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="flex items-start gap-2 rounded-xl bg-[#1b1b1b] p-2.5">
                            <Stethoscope size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[11px] font-semibold text-slate-200">Doctor Network</div>
                                <div className="text-[10px] text-slate-400 leading-tight">Verified specialists</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl bg-[#1b1b1b] p-2.5">
                            <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[11px] font-semibold text-slate-200">HIPAA Compliant</div>
                                <div className="text-[10px] text-slate-400 leading-tight">Private & secure</div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-[10px] text-slate-500">
                        ResQLink AI is designed for preliminary triage and doctor consultation. Not a replacement for emergency 911 services.
                    </p>
                </div>

            </div>
        </div>
    );
}
