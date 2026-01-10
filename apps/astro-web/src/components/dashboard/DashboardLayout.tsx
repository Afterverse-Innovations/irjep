"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { UserButton, useAuth } from "@clerk/astro/react";
import { Loader2, LayoutDashboard, Send, FileText, Users, BookOpen, ClipboardList } from "lucide-react";
import { useEffect } from "react";
import { Link } from "@/components/ui/link";
import { withConvex } from "@/components/ConvexClientProvider";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { userId, isLoaded: clerkLoaded, isSignedIn } = useAuth();
    const convexUser = useQuery(api.users.viewer);
    const syncUser = useMutation(api.users.syncUser);

    useEffect(() => {
        if (clerkLoaded && userId && isSignedIn && !convexUser && convexUser !== undefined) {
            // We'll sync with minimal data since we don't have the full user object
            syncUser({
                name: "Scholar", // Default name since we don't have access to full user data
                email: "", // We'll let the backend handle this via Clerk's user ID
            }).catch(console.error);
        }
    }, [clerkLoaded, userId, isSignedIn, convexUser, syncUser]);

    if (!clerkLoaded || convexUser === undefined) {
        return <div className="flex h-screen items-center justify-center text-stone-500 bg-stone-50"><Loader2 className="animate-spin mr-2" /> Loading Portal...</div>;
    }

    const user = convexUser;

    return (
        <div className="flex h-screen bg-stone-50 overflow-hidden">
            <aside className="w-64 border-r border-stone-100 bg-white p-6 hidden md:flex flex-col overflow-y-auto">
                <div className="mb-10">
                    <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-stone-900">IRJEP</Link>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Editorial Portal</div>
                </div>

                <nav className="space-y-1.5 text-sm font-medium flex-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                        <LayoutDashboard size={18} className="text-stone-400" />
                        <span>Overview</span>
                    </Link>

                    {/* Author Links */}
                    <div className="mt-10 mb-3 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">Author</div>
                    <Link href="/submit" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                        <Send size={18} className="text-stone-400" />
                        <span>New Submission</span>
                    </Link>
                    <Link href="/dashboard/submissions" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                        <FileText size={18} className="text-stone-400" />
                        <span>My Submissions</span>
                    </Link>

                    {/* Editor Links */}
                    {(user?.role === "editor" || user?.role === "admin") && (
                        <>
                            <div className="mt-10 mb-3 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">Editorial</div>
                            <Link href="/dashboard/queue" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                                <ClipboardList size={18} className="text-stone-400" />
                                <span>Review Queue</span>
                            </Link>
                        </>
                    )}

                    {/* Admin Links */}
                    {user?.role === "admin" && (
                        <>
                            <div className="mt-10 mb-3 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">Administration</div>
                            <Link href="/dashboard/users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                                <Users size={18} className="text-stone-400" />
                                <span>User Management</span>
                            </Link>
                            <Link href="/dashboard/issues" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all duration-200">
                                <BookOpen size={18} className="text-stone-400" />
                                <span>Manage Issues</span>
                            </Link>
                        </>
                    )}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-stone-100 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-stone-900">Dashboard</span>
                        {user && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{user.role} Account</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </header>
                <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <div className="mx-auto max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

const DashboardLayout = withConvex(DashboardLayoutInner);
export default DashboardLayout;
