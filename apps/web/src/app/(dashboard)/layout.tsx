"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { Loader2, LayoutDashboard, Send, FileText, Users, BookOpen, ClipboardList } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = useQuery(api.users.viewer);

    if (user === undefined) {
        return <div className="flex h-screen items-center justify-center text-stone-500"><Loader2 className="animate-spin mr-2" /> Loading Portal...</div>;
    }

    return (
        <div className="flex h-screen bg-stone-50">
            <aside className="w-64 border-r bg-white p-6 hidden md:block overflow-y-auto">
                <div className="mb-8">
                    <Link href="/" className="font-serif text-xl font-bold tracking-tight text-primary">IRJEP</Link>
                    <div className="text-xs text-stone-500 mt-1">Editorial Portal</div>
                </div>

                <nav className="space-y-1 text-sm font-medium">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                        <LayoutDashboard size={18} /> Overview
                    </Link>

                    {/* Author Links */}
                    <div className="mt-8 mb-2 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Author</div>
                    <Link href="/submit" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                        <Send size={18} /> New Submission
                    </Link>
                    <Link href="/dashboard/submissions" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                        <FileText size={18} /> My Submissions
                    </Link>

                    {/* Editor Links */}
                    {(user?.role === "editor" || user?.role === "admin") && (
                        <>
                            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Editorial</div>
                            <Link href="/dashboard/queue" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                                <ClipboardList size={18} /> Review Queue
                            </Link>
                        </>
                    )}

                    {/* Admin Links */}
                    {user?.role === "admin" && (
                        <>
                            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Administration</div>
                            <Link href="/dashboard/users" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                                <Users size={18} /> User Management
                            </Link>
                            <Link href="/dashboard/issues" className="flex items-center gap-3 px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                                <BookOpen size={18} /> Manage Issues
                            </Link>
                        </>
                    )}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex flex-col">
                        <span className="font-semibold text-stone-900">Dashboard</span>
                        {user && <span className="text-xs text-stone-500 capitalize">{user.role} Account</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
