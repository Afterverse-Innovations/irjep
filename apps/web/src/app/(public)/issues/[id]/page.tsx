"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssueDetailsPage() {
    const { id } = useParams();
    const issue = useQuery(api.issues.getById, { id: id as any });
    const articles = useQuery(api.articles.getArticlesByIssue, { issueId: id as any });

    if (issue === undefined || articles === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300" /></div>;
    }

    if (!issue) {
        return <div className="p-16 text-center text-stone-500 font-serif text-2xl">Issue Not Found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <Link href="/issues" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors mb-8 group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Archives
            </Link>

            <header className="mb-12 border-b border-stone-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Volume {issue.volume}, Issue {issue.issueNumber}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">{issue.publicationDate}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                    {issue.title}
                </h1>
            </header>

            <section>
                <h2 className="text-lg font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-stone-400" />
                    Table of Contents
                </h2>

                {articles.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 border border-dashed rounded-xl">
                        No papers have been assigned to this issue yet.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {articles.map((article: any) => (
                            <div key={article._id} className="group relative bg-white border border-stone-100 p-6 rounded-2xl hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300">
                                <Link href={`/articles/${article._id}`} className="block">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Research Paper</span>
                                            {article.pageRange && (
                                                <span className="text-[10px] text-stone-400 font-mono">pp. {article.pageRange}</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug">
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
                                <div className="mt-4 flex gap-4 border-t border-stone-50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/articles/${article._id}`} className="text-xs font-bold text-stone-900 uppercase tracking-widest hover:underline underline-offset-4 decoration-2 decoration-stone-200">
                                        Abstract
                                    </Link>
                                    <button className="text-xs font-bold text-stone-900 uppercase tracking-widest hover:underline underline-offset-4 decoration-2 decoration-stone-200">
                                        PDF Full Text
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
