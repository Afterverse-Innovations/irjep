"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Link } from "@/components/ui/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { withConvex } from "../ConvexClientProvider";

function LatestArticlesInner() {
    const articles = useQuery(api.articles.getLatestArticles);

    return (
        <section className="py-16 md:py-24 bg-stone-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-serif font-bold text-stone-900">Latest Research</h2>
                    <Link href="/issues" className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 decoration-stone-400">View Archive</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles === undefined ? (
                        <div className="text-center py-12 col-span-full"><Loader2 className="animate-spin inline mr-2" /> Loading latest research...</div>
                    ) : articles.length === 0 ? (
                        <div className="text-center text-stone-400 py-12 col-span-full">No papers published yet.</div>
                    ) : (
                        articles.map((article: any) => (
                            <div key={article._id} className="flex flex-col p-8 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-4 inline-block uppercase tracking-widest">Research Paper</span>
                                    <h3 className="text-xl font-bold mb-3 font-serif text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                        <Link href={`/articles/${article._id}`}>
                                            {article.title}
                                        </Link>
                                    </h3>
                                    <p className="text-stone-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {article.abstract}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 pt-6 border-t border-stone-50">
                                    <div className="flex items-center text-[11px] text-stone-400 font-medium">
                                        <span className="text-stone-900 truncate">By {article.authors?.join(", ")}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-stone-400 uppercase tracking-tighter font-bold">
                                            {new Date(article.publishDate || article._creationTime).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                                        </span>
                                        <Link href={`/articles/${article._id}`} className="text-[10px] font-bold uppercase tracking-widest text-stone-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group/link">
                                            Read Paper <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export const LatestArticlesSection = withConvex(LatestArticlesInner);
