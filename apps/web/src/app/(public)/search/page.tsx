"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const results = useQuery(api.articles.search, { query });

    return (
        <div className="container mx-auto px-4 py-16 min-h-[60vh]">
            <div className="max-w-3xl mx-auto space-y-8">
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
                    <div className="text-sm font-medium text-stone-500 mb-6 border-b pb-2">Results</div>

                    {query.length === 0 ? (
                        <div className="text-center text-stone-400 py-12">
                            Enter a search term to begin exploring the archives.
                        </div>
                    ) : results === undefined ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-stone-300" /></div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-stone-400 py-12">No results found for &quot;{query}&quot;.</div>
                    ) : (
                        <div className="space-y-6">
                            {results.map((article: any) => (
                                <div key={article._id} className="py-4 border-b border-stone-100 last:border-0 group">
                                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors">
                                        <Link href={`/articles/${article._id}`}>{article.title}</Link>
                                    </h3>
                                    <p className="text-stone-500 mb-2 line-clamp-2">
                                        {article.abstract}
                                    </p>
                                    <div className="text-xs text-stone-400 flex gap-2">
                                        <span>By Author</span>
                                        <span>•</span>
                                        <span>Updated {new Date(article.publishDate || Date.now()).toLocaleDateString()}</span>
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
