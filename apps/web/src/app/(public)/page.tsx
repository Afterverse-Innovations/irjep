"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Leaf, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-stone-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background shadow-xs mb-6 text-stone-600">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                        Accepting Submissions for Vol 1, Issue 3
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-stone-900 mb-6 mx-auto max-w-4xl leading-tight">
                        International Research Journal of <span className="text-stone-600 italic">Ethnomedicine</span> and Practices
                    </h1>
                    <p className="text-lg md:text-xl text-stone-600 mb-8 mx-auto max-w-2xl leading-relaxed">
                        A peer-reviewed, interdisciplinary platform bridging traditional knowledge systems with contemporary scientific inquiry.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/issues">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Read Latest Issue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/submit">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-white/50 backdrop-blur">
                                Submit Paper
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission / Stats */}
            <section className="py-16 md:py-24 bg-white border-y border-stone-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 mb-4">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-2 text-stone-900">Open Access</h3>
                            <p className="text-stone-600">Free and unrestricted access to all published research immediately upon publication.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 mb-4">
                                <Leaf className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-2 text-stone-900">Ethical Focus</h3>
                            <p className="text-stone-600">Committed to the ethical documentation and preservation of traditional medical knowledge.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-stone-200 text-stone-700 mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-2 text-stone-900">Peer Reviewed</h3>
                            <p className="text-stone-600">Rigorous blind peer-review process ensuring highest academic standards and validity.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Content Preview */}
            <LatestArticlesSection />
        </div>
    );
}

function LatestArticlesSection() {
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
                        <div className="text-center py-12"><Loader2 className="animate-spin inline mr-2" /> Loading latest research...</div>
                    ) : articles.length === 0 ? (
                        <div className="text-center text-stone-400 py-12">No papers published yet.</div>
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
