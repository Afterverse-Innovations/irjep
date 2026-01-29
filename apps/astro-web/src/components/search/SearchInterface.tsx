"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Link } from "@/components/ui/link";
import { withConvex } from "@/components/ConvexClientProvider";

function SearchInterfaceInner() {
    const [query, setQuery] = useState("");
    const results = useQuery(api.articles.search, { query });

    return (
        <div className="container mx-auto px-4 py-16 min-h-[60vh]">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">Search the Journal</h1>
                    <p className="text-stone-500 font-medium tracking-wide">Find research across traditional medicine disciplines.</p>
                </div>

                <div className="flex gap-2 max-w-3xl mx-auto">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-stone-300" />
                        <Input
                            placeholder="Keywords, titles, authors..."
                            className="pl-12 h-12 text-lg bg-white border-stone-200 rounded-xl focus-visible:ring-emerald-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="h-12 px-8 rounded-xl bg-stone-900">Search</Button>
                </div>

                <div className="mt-16">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-8 border-b border-stone-100 pb-2">Results</div>

                    {query.length === 0 ? (
                        <div className="text-center text-stone-300 py-16 font-serif italic text-lg">
                            Enter a search term to begin exploring the archives.
                        </div>
                    ) : results === undefined ? (
                        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-stone-200 h-10 w-10" /></div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-stone-500 py-16 bg-stone-50 rounded-3xl border border-stone-100 italic">No results found for &quot;{query}&quot;.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {results.map((article: any) => (
                                <div key={article._id} className="p-8 bg-white border border-stone-100 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col">
                                    <div className="flex-1">
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Research Paper</span>
                                        <h3 className="text-xl font-serif font-bold text-stone-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug">
                                            <Link href={`/articles/${article._id}`}>{article.title}</Link>
                                        </h3>
                                        <p className="text-sm text-stone-500 mb-6 line-clamp-3 leading-relaxed">
                                            {article.abstract}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 pt-6 border-t border-stone-50">
                                        <div className="text-[10px] text-stone-400 flex flex-wrap gap-2 items-center font-medium">
                                            <span className="text-stone-900">
                                                By {article.authorId ? (
                                                    <Link href={`/author/${article.authorId}`} className="hover:text-emerald-700 hover:underline transition-colors">
                                                        {article.authors?.join(", ")}
                                                    </Link>
                                                ) : (
                                                    article.authors?.join(", ")
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span className="truncate">{article.issueTitle || "Latest Research"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                                                {new Date(article.publishDate || article._creationTime).toLocaleDateString("en-US", { year: 'numeric', month: 'short' })}
                                            </span>
                                            <Link href={`/articles/${article._id}`} className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-900 hover:text-emerald-700 flex items-center gap-1 group/btn transition-colors">
                                                Read Paper <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const SearchInterface = withConvex(SearchInterfaceInner);
