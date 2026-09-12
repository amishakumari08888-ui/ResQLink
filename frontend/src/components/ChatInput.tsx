import { useState, useRef, useEffect } from "react";
import { Plus, ArrowUp, Mic, MicOff, Stethoscope, StopCircle, X, ImageIcon, AlertCircle, Lock, LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface ChatInputProps {
    onSend: (message: string, image?: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

interface ImageAttachment {
    dataUrl: string;
    name: string;
    size: number;
}

// Browser Web Speech Recognition Type declarations
interface IWindow extends Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
}

export default function ChatInput({
    onSend,
    loading = false,
    disabled = false,
}: ChatInputProps) {
    const { user, openAuthModal } = useAuthStore();
    const [text, setText] = useState("");
    const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const isDisabled = loading || disabled || !user;

    // Auto-adjust textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [text]);

    // Cleanup speech recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore cleanup error
                }
            }
        };
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // --- Image Handling ---
    const processImageFile = (file: File) => {
        if (!user) {
            openAuthModal();
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("Please select a valid image file (PNG, JPG, WEBP, etc.).");
            return;
        }

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            showToast("Image size should be less than 10MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setSelectedImage({
                dataUrl,
                name: file.name,
                size: file.size,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
        // Reset file input value so re-uploading same file works
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDisabled && user) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isDisabled || !user) {
            if (!user) openAuthModal();
            return;
        }

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (isDisabled || !user) return;
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                    processImageFile(file);
                    break;
                }
            }
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // --- Microphone / Speech Recognition ---
    const toggleSpeechRecognition = () => {
        if (!user) {
            openAuthModal();
            return;
        }

        if (isDisabled) return;

        if (isListening) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore
                }
            }
            setIsListening(false);
            return;
        }

        const win = window as unknown as IWindow;
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (!SpeechRecognitionClass) {
            showToast("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        try {
            const recognition = new SpeechRecognitionClass();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = navigator.language || "en-US";

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = "";
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    setText((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech Recognition error:", event.error);
                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    showToast("Microphone access was denied. Please allow microphone permissions in your browser.");
                } else if (event.error !== "no-speech") {
                    showToast(`Microphone error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error("Failed to start speech recognition:", err);
            showToast("Could not start microphone. Please check permissions.");
            setIsListening(false);
        }
    };

    // --- Submission ---
    const handleSubmit = () => {
        if (!user) {
            openAuthModal();
            return;
        }

        const hasText = Boolean(text.trim());
        const hasImage = Boolean(selectedImage);

        if ((!hasText && !hasImage) || isDisabled) return;

        // If currently dictating, stop mic
        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore
            }
            setIsListening(false);
        }

        onSend(text.trim(), selectedImage?.dataUrl);
        setText("");
        setSelectedImage(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const hasInput = Boolean(text.trim() || selectedImage);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
            {/* Feedback / Error Toast */}
            {toastMessage && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-950/90 border border-red-500/40 px-3.5 py-2 text-xs text-red-200 shadow-lg animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-red-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="text-red-400 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Listening Banner */}
            {isListening && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/30 px-3.5 py-2 text-xs text-red-300 shadow-md animate-pulse">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span>Listening... Speak your symptoms, prescription, or question now.</span>
                    </div>
                    <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-200 hover:bg-red-500/40 transition-colors"
                    >
                        Stop
                    </button>
                </div>
            )}

            {!user ? (
                /* Unauthenticated Force Login CTA */
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[24px] border border-cyan-500/30 bg-[#292929] p-4 shadow-xl">
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                            <Lock size={18} />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">Sign In Required to Chat</p>
                            <p className="text-xs text-slate-400 mt-0.5">Please sign in with Firebase to consult Emma and access doctor recommendations.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openAuthModal}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-black shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-all shrink-0 active:scale-[0.98]"
                    >
                        <LogIn size={15} />
                        <span>Sign In / Register</span>
                    </button>
                </div>
            ) : (
                /* Main Input Container for Authenticated Users */
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    className={`
                        relative flex flex-col gap-2 
                        rounded-[26px] border bg-[#2f2f2f] 
                        px-3 py-2.5 shadow-xl transition-all duration-200
                        focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400/50
                        ${isDragging ? "border-cyan-400 ring-2 ring-cyan-400/40 bg-[#353535]" : "border-[#383838]"}
                    `}
                >
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Attached Image Preview Chip */}
                    {selectedImage && (
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#242424] border border-[#3e3e3e] w-fit max-w-full">
                            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-slate-700 bg-black/40">
                                <img
                                    src={selectedImage.dataUrl}
                                    alt="Selected upload"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col min-w-0 pr-1">
                                <span className="text-xs font-medium text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">
                                    {selectedImage.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    {formatFileSize(selectedImage.size)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={removeImage}
                                title="Remove image"
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    {/* Bottom Row: Controls + Textarea */}
                    <div className="flex items-end gap-2">
                        {/* Plus / Image Upload Attachment Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isDisabled}
                            title="Upload medical image, prescription or symptom photo"
                            className={`
                                flex h-9 w-9 shrink-0 items-center justify-center 
                                rounded-full transition-colors disabled:opacity-40
                                ${selectedImage 
                                    ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" 
                                    : "text-slate-400 hover:bg-[#3f3f3f] hover:text-slate-100"}
                            `}
                        >
                            {selectedImage ? <ImageIcon size={19} /> : <Plus size={20} />}
                        </button>

                        {/* Multiline Textarea */}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={text}
                            disabled={isDisabled}
                            placeholder={
                                selectedImage
                                    ? "Add notes about this image, or press send to analyze..."
                                    : isListening
                                    ? "Listening to your voice..."
                                    : "Ask ResQLink AI about symptoms, doctors, or medicines..."
                            }
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            className="
                                flex-1 resize-none border-none bg-transparent 
                                py-1.5 px-1 text-[15px] font-normal text-slate-100 
                                placeholder:text-slate-400 focus:outline-none 
                                max-h-44 leading-relaxed
                            "
                        />

                        {/* Microphone Speech Recognition Button */}
                        <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            disabled={isDisabled}
                            title={isListening ? "Listening... Click to stop" : "Voice input (Speak symptoms)"}
                            className={`
                                flex h-9 w-9 shrink-0 items-center justify-center 
                                rounded-full transition-all disabled:opacity-40
                                ${isListening
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse hover:bg-red-600"
                                    : "text-slate-400 hover:bg-[#3f3f3f] hover:text-slate-100"}
                            `}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        {/* Doctor Database Indicator */}
                        <button
                            type="button"
                            disabled={isDisabled}
                            title="Doctor Database active"
                            className="
                                flex h-9 w-9 shrink-0 items-center justify-center 
                                rounded-full text-cyan-400 hover:bg-[#3f3f3f] 
                                transition-colors disabled:opacity-40
                            "
                        >
                            <Stethoscope size={18} />
                        </button>

                        {/* Submit / Send Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!hasInput || isDisabled}
                            className="
                                flex h-9 w-9 shrink-0 items-center justify-center 
                                rounded-full bg-white text-black font-bold 
                                transition-all duration-200 hover:bg-slate-200 
                                disabled:bg-[#424242] disabled:text-slate-500 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? (
                                <StopCircle size={18} className="animate-spin text-slate-300" />
                            ) : (
                                <ArrowUp size={19} />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Disclaimer Footer */}
            <p className="mt-2.5 text-center text-[11px] font-medium text-slate-400">
                ResQLink AI can make mistakes. Verify important clinical information with a doctor.
            </p>
        </div>
    );
}
