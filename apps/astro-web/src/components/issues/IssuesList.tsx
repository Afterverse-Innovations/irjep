"use client";
import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { withConvex } from "@/components/ConvexClientProvider";

function IssuesListInner() {
    const issues = useQuery(api.issues.getPublishedIssues);

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-serif font-bold mb-8 text-stone-900 border-b border-stone-100 pb-4">Journal Archive</h1>

            {issues === undefined ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-stone-300 h-8 w-8" /></div>
            ) : issues.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-stone-50 border-stone-200">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-stone-200" />
                    <h3 className="text-xl font-serif font-bold text-stone-900">No Issues Published Yet</h3>
                    <p className="text-stone-500 mt-2">Check back soon for Volume 1, Issue 1.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {issues.map((issue: any) => (
                        <div key={issue._id} className="group border border-stone-100 p-8 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                                <BookOpen className="h-8 w-8 text-stone-300 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">{issue.title}</h2>
                            <p className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mb-6">
                                Vol {issue.volume}, Issue {issue.issueNumber} • {issue.publicationDate}
                            </p>
                            <Button variant="outline" asChild className="w-full rounded-xl hover:bg-stone-900 hover:text-white transition-colors">
                                <Link href={`/issues/${issue._id}`}>View Table of Contents</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const IssuesList = withConvex(IssuesListInner);
