import { useState, useEffect, useMemo } from "react";
import {
    Users,
    Cpu,
    MessageSquare,
    MessageSquareCode,
    RefreshCw,
    ArrowLeft,
    Search,
    Shield,
    Activity,
    Calendar,
    Clock,
    Zap,
    CheckCircle2,
    Database,
} from "lucide-react";
import {
    fetchAdminStats,
    fetchAdminUsers,
    fetchDailyUsage,
    type AdminStats,
    type AdminUser,
    type DailyUsage,
} from "../api/adminApi";

interface AdminPanelProps {
    onBackToChat: () => void;
}

export default function AdminPanel({ onBackToChat }: AdminPanelProps) {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [providerFilter, setProviderFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"lastLogin" | "tokens" | "prompts" | "date">("lastLogin");
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const loadData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        setError(null);
        try {
            const [statsData, usersData, dailyData] = await Promise.all([
                fetchAdminStats(),
                fetchAdminUsers(),
                fetchDailyUsage(7),
            ]);
            setStats(statsData);
            setUsers(usersData);
            setDailyUsage(dailyData);
            setLastUpdated(new Date());
        } catch (err: any) {
            setError(err.message || "Failed to fetch admin data from backend.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(), 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter & Sort users
    const filteredUsers = useMemo(() => {
        return users
            .filter((u) => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !query ||
                    (u.displayName && u.displayName.toLowerCase().includes(query)) ||
                    (u.email && u.email.toLowerCase().includes(query)) ||
                    u.firebaseUid.toLowerCase().includes(query);

                const matchesProvider =
                    providerFilter === "ALL" ||
                    (u.authProvider && u.authProvider.toLowerCase() === providerFilter.toLowerCase());

                return matchesSearch && matchesProvider;
            })
            .sort((a, b) => {
                if (sortBy === "tokens") return b.totalTokens - a.totalTokens;
                if (sortBy === "prompts") return b.totalPrompts - a.totalPrompts;
                if (sortBy === "date") {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
                const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
                return bTime - aTime;
            });
    }, [users, searchQuery, providerFilter, sortBy]);

    const maxDailyTokens = useMemo(() => {
        if (!dailyUsage.length) return 1;
        return Math.max(...dailyUsage.map((d) => d.totalTokens), 10);
    }, [dailyUsage]);

    const formatDate = (isoString?: string | null) => {
        if (!isoString) return "Never";
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return isoString;
        }
    };

    const formatRelativeTime = (isoString?: string | null) => {
        if (!isoString) return "Never";
        try {
            const diffMs = Date.now() - new Date(isoString).getTime();
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) return "Just now";
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHr = Math.floor(diffMin / 60);
            if (diffHr < 24) return `${diffHr}h ago`;
            const diffDay = Math.floor(diffHr / 24);
            return `${diffDay}d ago`;
        } catch {
            return "Unknown";
        }
    };

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#141414] text-slate-100 font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#282828] bg-[#1a1a1a]/95 px-4 md:px-8 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBackToChat}
                        className="flex items-center gap-2 rounded-xl bg-[#262626] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-[#323232] hover:text-white active:scale-95 border border-[#333333]"
                        title="Return to Chat"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Chat</span>
                    </button>

                    <div className="h-5 w-px bg-[#333333]" />

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                                Admin Dashboard
                                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 rounded-xl border border-[#333333] bg-[#222222] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#2e2e2e] hover:text-white disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin text-cyan-400" : ""} />
                        <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
                        <span>{error}</span>
                        <button
                            onClick={() => loadData(true)}
                            className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/30"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tokens Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Tokens Count
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <Cpu size={20} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-extrabold tracking-tight text-white">
                                {loading ? "..." : (stats?.totalTokens ?? 0).toLocaleString()}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                <span className="font-medium text-cyan-300">
                                    {(stats?.totalInputTokens ?? 0).toLocaleString()} in
                                </span>
                                <span>•</span>
                                <span className="font-medium text-emerald-300">
                                    {(stats?.totalOutputTokens ?? 0).toLocaleString()} out
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-[#2a2a2a] pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="text-slate-400">Today:</span>
                            <span className="font-semibold text-cyan-400">
                                +{(stats?.todayTokens ?? 0).toLocaleString()} tokens
                            </span>
                        </div>
                    </div>

                    {/* Total Users Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Users
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-extrabold tracking-tight text-white">
                                {loading ? "..." : (stats?.totalUsers ?? 0).toLocaleString()}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                                <CheckCircle2 size={13} className="text-emerald-400" />
                                <span>Registered in PostgreSQL</span>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-[#2a2a2a] pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="text-slate-400">Active today:</span>
                            <span className="font-semibold text-emerald-400">
                                {stats?.todayUsersActive ?? 0} user{stats?.todayUsersActive === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>

                    {/* Total Prompts Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Prompts
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                <MessageSquareCode size={20} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-extrabold tracking-tight text-white">
                                {loading ? "..." : (stats?.totalPrompts ?? 0).toLocaleString()}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Activity size={13} className="text-violet-400" />
                                <span>AI requests processed</span>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-[#2a2a2a] pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="text-slate-400">Today:</span>
                            <span className="font-semibold text-violet-400">
                                +{(stats?.todayPrompts ?? 0).toLocaleString()} prompts
                            </span>
                        </div>
                    </div>

                    {/* Total Conversations & Model */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Conversations
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <MessageSquare size={20} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl font-extrabold tracking-tight text-white">
                                {loading ? "..." : (stats?.totalConversations ?? 0).toLocaleString()}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Database size={13} className="text-amber-400" />
                                <span className="truncate">Sessions created</span>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-[#2a2a2a] pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="text-slate-400">Model:</span>
                            <span className="font-semibold text-amber-400 truncate max-w-[140px]" title={stats?.aiModel}>
                                {stats?.aiModel?.replace("openai/", "") ?? "Groq AI"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 7-Day Token Usage Visual Trend */}
                <div className="rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2a2a2a]">
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Zap size={16} className="text-cyan-400" />
                                7-Day Token Usage History
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Daily consumption breakdown (input tokens, output tokens & prompt volume)
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
                                <span>Input</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                <span>Output</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4">
                        {dailyUsage.map((day) => {
                            const total = day.totalTokens;
                            const heightPct = Math.max(8, Math.round((total / maxDailyTokens) * 100));
                            const inPct = total > 0 ? (day.inputTokens / total) * 100 : 50;
                            const outPct = total > 0 ? (day.outputTokens / total) * 100 : 50;
                            const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "numeric",
                                day: "numeric",
                            });

                            return (
                                <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                                    <div className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                        {total.toLocaleString()}
                                    </div>
                                    <div
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full max-w-[42px] rounded-lg overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:ring-2 group-hover:ring-cyan-400/50 bg-[#2b2b2b]"
                                    >
                                        <div
                                            style={{ height: `${outPct}%` }}
                                            className="bg-emerald-500 w-full transition-all"
                                            title={`Output: ${day.outputTokens} tokens`}
                                        />
                                        <div
                                            style={{ height: `${inPct}%` }}
                                            className="bg-cyan-500 w-full transition-all"
                                            title={`Input: ${day.inputTokens} tokens`}
                                        />
                                    </div>
                                    <div className="mt-2 text-[10px] font-medium text-slate-400 truncate w-full text-center">
                                        {dateLabel}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Users Management Section ("Show the user") */}
                <div className="rounded-2xl border border-[#2b2b2b] bg-[#1e1e1e] p-5 shadow-lg space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Users size={16} className="text-emerald-400" />
                                Registered Users ({filteredUsers.length})
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Full user directory with token consumption, prompt counts, and activity records
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Search bar */}
                            <div className="relative min-w-[220px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or UID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-[#333333] bg-[#141414] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>

                            {/* Provider Filter */}
                            <select
                                value={providerFilter}
                                onChange={(e) => setProviderFilter(e.target.value)}
                                className="rounded-xl border border-[#333333] bg-[#141414] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                            >
                                <option value="ALL">All Providers</option>
                                <option value="google">Google</option>
                                <option value="password">Password</option>
                                <option value="anonymous">Anonymous</option>
                            </select>

                            {/* Sort By */}
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="rounded-xl border border-[#333333] bg-[#141414] px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                            >
                                <option value="lastLogin">Recent Login</option>
                                <option value="tokens">Most Tokens</option>
                                <option value="prompts">Most Prompts</option>
                                <option value="date">Newest Registered</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto rounded-xl border border-[#2b2b2b]">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="border-b border-[#2b2b2b] bg-[#171717] text-[11px] uppercase font-semibold text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-3 py-3">Auth Provider</th>
                                    <th className="px-3 py-3 text-right">Tokens Used</th>
                                    <th className="px-3 py-3 text-right">Prompts</th>
                                    <th className="px-3 py-3 text-right">Chats</th>
                                    <th className="px-3 py-3">Last Active</th>
                                    <th className="px-4 py-3">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#262626]">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                                            {loading ? "Loading users data..." : "No users found matching your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const initials = u.displayName
                                            ? u.displayName
                                                  .split(" ")
                                                  .map((p) => p[0])
                                                  .join("")
                                                  .substring(0, 2)
                                                  .toUpperCase()
                                            : "U";

                                        return (
                                            <tr
                                                key={u.id}
                                                onClick={() => setSelectedUser(u)}
                                                className="hover:bg-[#252525] transition-colors cursor-pointer"
                                            >
                                                {/* User avatar & info */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {u.photoUrl ? (
                                                            <img
                                                                src={u.photoUrl}
                                                                alt={u.displayName || "User"}
                                                                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-xs font-bold text-white shadow-sm">
                                                                {initials}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-white truncate max-w-[180px]">
                                                                {u.displayName || "Anonymous User"}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                                                {u.email || u.firebaseUid}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Provider */}
                                                <td className="px-3 py-3.5">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#292929] px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-[#383838]">
                                                        {u.authProvider || "google"}
                                                    </span>
                                                </td>

                                                {/* Tokens Used */}
                                                <td className="px-3 py-3.5 text-right">
                                                    <div className="font-bold text-cyan-300">
                                                        {u.totalTokens.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        {u.inputTokens.toLocaleString()} in / {u.outputTokens.toLocaleString()} out
                                                    </div>
                                                </td>

                                                {/* Prompts */}
                                                <td className="px-3 py-3.5 text-right">
                                                    <div className="font-semibold text-white">
                                                        {u.totalPrompts.toLocaleString()}
                                                    </div>
                                                    {u.todayPrompts > 0 && (
                                                        <div className="text-[10px] text-emerald-400 font-medium">
                                                            +{u.todayPrompts} today
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Conversation Count */}
                                                <td className="px-3 py-3.5 text-right font-medium text-slate-300">
                                                    {u.conversationCount.toLocaleString()}
                                                </td>

                                                {/* Last Active */}
                                                <td className="px-3 py-3.5 text-slate-300 whitespace-nowrap">
                                                    <span className="flex items-center gap-1 text-[11px]">
                                                        <Clock size={12} className="text-slate-500" />
                                                        {formatRelativeTime(u.lastLoginAt)}
                                                    </span>
                                                </td>

                                                {/* Created At */}
                                                <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-slate-500" />
                                                        {formatDate(u.createdAt)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Selected User Details Modal */}
            {selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-[#383838] bg-[#1e1e1e] p-6 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-[#2b2b2b] pb-3">
                            <div className="flex items-center gap-3">
                                {selectedUser.photoUrl ? (
                                    <img
                                        src={selectedUser.photoUrl}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-cyan-400/30"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white font-bold text-sm">
                                        {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : "U"}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white text-base">
                                        {selectedUser.displayName || "User Details"}
                                    </h3>
                                    <p className="text-xs text-slate-400">{selectedUser.email || "No email"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#2e2e2e] hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-[#141414] p-3 border border-[#2b2b2b]">
                                <span className="text-slate-400">Total Tokens</span>
                                <div className="text-lg font-bold text-cyan-300 mt-1">
                                    {selectedUser.totalTokens.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    {selectedUser.inputTokens.toLocaleString()} in / {selectedUser.outputTokens.toLocaleString()} out
                                </div>
                            </div>

                            <div className="rounded-xl bg-[#141414] p-3 border border-[#2b2b2b]">
                                <span className="text-slate-400">Prompts Sent</span>
                                <div className="text-lg font-bold text-emerald-300 mt-1">
                                    {selectedUser.totalPrompts.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    {selectedUser.todayPrompts} prompts today
                                </div>
                            </div>

                            <div className="rounded-xl bg-[#141414] p-3 border border-[#2b2b2b]">
                                <span className="text-slate-400">Conversations</span>
                                <div className="text-lg font-bold text-amber-300 mt-1">
                                    {selectedUser.conversationCount.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Chat threads</div>
                            </div>

                            <div className="rounded-xl bg-[#141414] p-3 border border-[#2b2b2b]">
                                <span className="text-slate-400">Auth Method</span>
                                <div className="text-sm font-semibold text-slate-200 mt-1 capitalize">
                                    {selectedUser.authProvider || "google"}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">Provider</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-[#141414] p-3 border border-[#2b2b2b] text-xs space-y-1.5">
                            <div className="flex justify-between text-slate-400">
                                <span>Firebase UID:</span>
                                <span className="text-slate-300 font-mono text-[10px] truncate max-w-[200px]">
                                    {selectedUser.firebaseUid}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Registered At:</span>
                                <span className="text-slate-300">{formatDate(selectedUser.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Last Active:</span>
                                <span className="text-slate-300">{formatDate(selectedUser.lastLoginAt)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedUser(null)}
                            className="w-full rounded-xl bg-[#2a2a2a] py-2 text-xs font-semibold text-slate-200 hover:bg-[#333333] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
