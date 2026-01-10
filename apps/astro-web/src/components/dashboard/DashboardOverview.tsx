"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { ArrowRight, Loader2, Send } from "lucide-react";
import { withConvex } from "@/components/ConvexClientProvider";

function DashboardOverviewInner() {
    const user = useQuery(api.users.viewer);
    const submissions = useQuery(api.submissions.getMySubmissions);
    const pending = useQuery(api.submissions.getPendingSubmissions);

    if (user === undefined) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-stone-300 h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">Dashboard Overview</h1>
                <p className="text-stone-500 font-medium tracking-wide">Welcome back, {user?.name || "Scholar"}.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/submissions" className="block group">
                    <Card className="bg-white border-stone-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2 border-b border-stone-50">
                            <CardTitle className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">My Submissions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="text-4xl font-serif font-bold text-stone-900 leading-none">{submissions?.length ?? 0}</div>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-4">Lifetime research activity</p>
                        </CardContent>
                    </Card>
                </Link>

                {(user?.role === "editor" || user?.role === "admin") && (
                    <Link href="/dashboard/queue" className="block group">
                        <Card className="bg-white border-stone-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-2 border-b border-stone-50">
                                <CardTitle className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pending Reviews</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-4xl font-serif font-bold text-emerald-600 leading-none">{pending?.length ?? 0}</div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-4">Require editorial attention</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>

            {(!user || user.role === "author") && (
                <div className="p-8 bg-stone-900 rounded-[2rem] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                    <div className="relative z-10 max-w-xl space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif font-bold leading-tight">Submit a New Research Paper</h2>
                            <p className="text-stone-400 text-sm leading-relaxed">Ready to publish your latest findings? Our streamlined submission process ensures your research reaches the global ethnomedicine community.</p>
                        </div>
                        <Link href="/submit">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px]">
                                Start Submission <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export const DashboardOverview = withConvex(DashboardOverviewInner);
