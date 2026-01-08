"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const user = useQuery(api.users.viewer);
    const submissions = useQuery(api.submissions.getMySubmissions);
    const pending = useQuery(api.submissions.getPendingSubmissions);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
                <p className="text-stone-500">Welcome back, {user?.name || "Scholar"}.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/submissions" className="block cursor-pointer">
                    <Card className="bg-white border-stone-200 shadow-sm hover:border-primary/20 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-stone-500">My Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-stone-900">{submissions?.length ?? 0}</div>
                            <p className="text-xs text-stone-400 mt-1">Lifetime submissions</p>
                        </CardContent>
                    </Card>
                </Link>

                {(user?.role === "editor" || user?.role === "admin") && (
                    <Link href="/dashboard/queue" className="block cursor-pointer">
                        <Card className="bg-white border-stone-200 shadow-sm hover:border-amber-200 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-stone-500">Pending Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">{pending?.length ?? 0}</div>
                                <p className="text-xs text-stone-400 mt-1">Require attention</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>

            {(!user || user.role === "author") && (
                <Card className="bg-stone-50 border-dashed border-2 border-stone-200 shadow-none">
                    <CardHeader>
                        <CardTitle className="font-serif text-xl">Submit a New Paper</CardTitle>
                        <CardDescription>Ready to publish your research? Start the submission process now.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/submit">
                            <Button className="font-medium">Start Submission <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
