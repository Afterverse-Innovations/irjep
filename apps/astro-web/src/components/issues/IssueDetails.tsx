"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, ArrowLeft, FileText, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { withConvex } from "@/components/ConvexClientProvider";

function IssueDetailsInner({ id }: { id: string }) {
    const issue = useQuery(api.issues.getById, { id: id as any });
    const articles = useQuery(api.articles.getArticlesByIssue, { issueId: id as any });

    if (issue === undefined || articles === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300 h-8 w-8" /></div>;
    }

    if (!issue) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-stone-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">Issue Not Found</h2>
                <Button variant="outline" asChild>
                    <Link href="/issues">Back to Archives</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <Link href="/issues" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-8 group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Archives
            </Link>

            <header className="mb-12 border-b border-stone-100 pb-8 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Volume {issue.volume}, Issue {issue.issueNumber}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{issue.publicationDate}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                    {issue.title}
                </h1>
            </header>

            <section>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-2">
                    <FileText size={14} />
                    Table of Contents
                </h2>

                {articles.length === 0 ? (
                    <div className="text-center py-16 text-stone-300 border-2 border-dashed rounded-3xl">
                        No papers have been assigned to this issue yet.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {articles.map((article: any) => (
                            <div key={article._id} className="group relative bg-white border border-stone-100 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <Link href={`/articles/${article._id}`} className="block">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Research Paper</span>
                                            {article.pageRange && (
                                                <span className="text-[10px] text-stone-400 font-mono">pp. {article.pageRange}</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <User size={12} className="text-stone-400" />
                                            <span className="text-xs text-stone-600 font-medium">
                                                {article.authors?.join(", ")}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="mt-6 flex gap-6 border-t border-stone-50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/articles/${article._id}`} className="text-[10px] font-bold text-stone-900 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                                        Abstract
                                    </Link>
                                    <Link href={`/articles/${article._id}`} className="text-[10px] font-bold text-stone-900 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                                        PDF Full Text
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export const IssueDetails = withConvex(IssueDetailsInner);
