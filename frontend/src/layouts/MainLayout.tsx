import { type ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#212121] text-slate-100 font-sans">
            {/* ChatGPT Sidebar */}
            <Sidebar />

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col h-full min-w-0 relative">
                <Header />

                <main className="flex flex-1 flex-col min-h-0 relative bg-[#212121]">
                    {children}
                </main>
            </div>
        </div>
    );
}