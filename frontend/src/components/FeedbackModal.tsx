import { useState } from "react";
import { Star, X, MessageSquareHeart, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { submitFeedbackApi } from "../api/feedbackApi";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerReason?: "LIMIT_REACHED" | "THREE_CONVERSATIONS" | "MANUAL";
}

export default function FeedbackModal({
    isOpen,
    onClose,
    triggerReason = "MANUAL",
}: FeedbackModalProps) {
    const { user } = useAuthStore();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const ratingDescriptions = [
        "",
        "Needs Improvement 😟",
        "Fair, could be better 😐",
        "Good & helpful 🙂",
        "Very Good! Impressed 😊",
        "Excellent Medical AI! 🌟",
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a star rating between 1 and 5.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitFeedbackApi({
                userId: user?.uid || "anonymous-patient",
                userEmail: user?.email || undefined,
                rating,
                review: review.trim() || undefined,
                triggerReason,
            });

            setIsSubmitted(true);
            // Save flag so user isn't prompted repeatedly
            localStorage.setItem("nexcure_feedback_given_v1", "true");
            setTimeout(() => {
                setIsSubmitted(false);
                setRating(0);
                setReview("");
                onClose();
            }, 2500);
        } catch (err: any) {
            setError(err.message || "Failed to submit feedback. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#3a3a3a] bg-[#222222] p-6 text-slate-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-[#2f2f2f] hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {isSubmitted ? (
                    <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-xs">
                            Your review helps us refine Emma's clinical triage and doctor recommendations.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md">
                                <MessageSquareHeart size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {triggerReason === "LIMIT_REACHED"
                                    ? "Usage Limit Reached"
                                    : triggerReason === "THREE_CONVERSATIONS"
                                    ? "How are we doing?"
                                    : "We Value Your Feedback"}
                            </h2>
                            <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
                                {triggerReason === "LIMIT_REACHED"
                                    ? "You've used your daily free tier (8 prompts / 1,200 tokens). Tell us how Emma did with your symptoms!"
                                    : triggerReason === "THREE_CONVERSATIONS"
                                    ? "You have completed 3 consultations with NexCure AI! Please rate your experience so far."
                                    : "Share your rating and thoughts to help us enhance clinical triage for everyone."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-950/80 border border-red-500/40 p-2.5 text-center text-xs text-red-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-1.5 py-1">
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const active = (hoverRating || rating) >= star;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="p-1 text-slate-600 transition-all hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`transition-colors ${
                                                        active
                                                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                            : "text-slate-600 hover:text-slate-400"
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="h-5 text-xs font-semibold text-amber-400">
                                    {ratingDescriptions[hoverRating || rating] || "Tap a star to rate"}
                                </span>
                            </div>

                            {/* Written Review */}
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                                    Write a review (optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={review}
                                    placeholder="Tell us what you liked, which doctor recommendations were helpful, or how Emma can improve..."
                                    onChange={(e) => setReview(e.target.value)}
                                    className="w-full resize-none rounded-2xl border border-[#383838] bg-[#2a2a2a] p-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none leading-relaxed"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-2xl border border-[#444] bg-transparent py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#2c2c2c] transition-colors"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || rating === 0}
                                    className="
                                        flex-1 rounded-2xl bg-cyan-500 py-2.5 text-xs 
                                        font-bold text-black shadow-md shadow-cyan-500/20 
                                        transition-all hover:bg-cyan-400 active:scale-[0.99] 
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                    "
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
