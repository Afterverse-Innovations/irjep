"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const results = useQuery(api.articles.search, { query });

    return (
        <div className="container mx-auto px-4 py-16 min-h-[60vh]">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Search the Journal</h1>
                    <p className="text-stone-500">Find research across traditional medicine disciplines.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <Input
                            placeholder="Search by title, author, or keyword..."
                            className="pl-10 h-12 text-lg bg-white"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="h-12 px-8">Search</Button>
                </div>

                <div className="mt-12">
                    <div className="text-sm font-medium text-stone- stone-500 mb-6 border-b pb-2">Results</div>

                    {query.length === 0 ? (
                        <div className="text-center text-stone-400 py-12">
                            Enter a search term to begin exploring the archives.
                        </div>
                    ) : results === undefined ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-stone-300" /></div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-stone-400 py-12">No results found for &quot;{query}&quot;.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((article: any) => (
                                <div key={article._id} className="p-6 bg-white border border-stone-100 rounded-2xl hover:shadow-lg transition-all duration-300 group flex flex-col">
                                    <div className="flex-1">
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Research Paper</span>
                                        <h3 className="text-lg font-serif font-bold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors leading-snug">
                                            <Link href={`/articles/${article._id}`}>{article.title}</Link>
                                        </h3>
                                        <p className="text-xs text-stone-500 mb-4 line-clamp-3 leading-relaxed">
                                            {article.abstract}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4 border-t border-stone-50">
                                        <div className="text-[10px] text-stone-400 flex flex-wrap gap-2 items-center">
                                            <span className="font-medium text-stone-600 truncate max-w-[150px]">By {article.authors?.join(", ")}</span>
                                            <span>•</span>
                                            <span className="truncate">{article.issueTitle || "Latest Research"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                                                {new Date(article.publishDate || Date.now()).toLocaleDateString("en-US", { year: 'numeric', month: 'short' })}
                                            </span>
                                            <Link href={`/articles/${article._id}`} className="text-[10px] font-bold uppercase tracking-widest text-stone-900 hover:text-emerald-700 flex items-center gap-1">
                                                Read <ArrowRight size={10} />
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
