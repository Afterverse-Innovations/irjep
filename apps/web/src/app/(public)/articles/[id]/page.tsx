"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2, FileText, Download, Share2, Printer, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArticleDetailsPage() {
    const { id } = useParams();
    const article = useQuery(api.articles.getArticleById, { articleId: id as any });

    if (article === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!article) {
        return <div className="p-16 text-center text-stone-500 font-serif text-2xl">Paper Not Found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <nav className="mb-8 flex items-center text-xs text-stone-400 gap-2 overflow-x-auto whitespace-nowrap pb-2">
                <a href="/issues" className="hover:text-stone-900 transition-colors">Issues</a>
                <span>/</span>
                <span className="text-stone-900">Research Paper</span>
                <span>/</span>
                <span className="truncate">{article.title}</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-6">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600 mb-8 pb-8 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-stone-400" />
                        <span className="font-medium text-stone-900">Author ID: {article.authorId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-stone-400" />
                        <span>Published: {new Date(article.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-stone-400" />
                        <span>Page: 12-25</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-stone-900">
                        <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 size={16} className="mr-2" /> Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                </div>
            </header>

            <div className="grid md:grid-cols-4 gap-12">
                <div className="md:col-span-3 space-y-10">
                    <section>
                        <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 border-b pb-2 uppercase tracking-wide">Abstract</h2>
                        <p className="text-stone-800 leading-relaxed text-lg font-light italic bg-stone-50 p-6 rounded-lg border-l-4 border-stone-200">
                            {article.abstract}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 border-b pb-2 uppercase tracking-wide">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {article.keywords?.map((kw: string) => (
                                <span key={kw} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm text-stone-600">
                                    {kw}
                                </span>
                            )) || <span className="text-stone-400 text-sm">Ethnomedicine, Traditional Practices, IRJEP</span>}
                        </div>
                    </section>

                    <section className="pt-8 text-stone-500 text-xs italic space-y-2">
                        <p>© {new Date().getFullYear()} International Research Journal of Ethnomedicine and Practices. All rights reserved.</p>
                        <p>How to cite: Author. ({new Date(article.updatedAt).getFullYear()}). {article.title}. IRJEP, Vol 1(2), pp. 12-25.</p>
                    </section>
                </div>

                <aside className="md:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">Metrics</h3>
                            <div className="space-y-3 text-xs text-stone-600 font-medium">
                                <div className="flex justify-between">
                                    <span>Views</span>
                                    <span className="text-stone-900">1,240</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Downloads</span>
                                    <span className="text-stone-900">342</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Citations</span>
                                    <span className="text-stone-900">12</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-wider underline underline-offset-8 decoration-stone-200">Related</h3>
                            <ul className="space-y-4 text-xs font-serif leading-tight">
                                <li className="hover:text-primary cursor-pointer transition-colors">Digital Documentation of Ayurvedic Papers</li>
                                <li className="hover:text-primary cursor-pointer transition-colors">Methodological Ethics in Tribal Medicine Research</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
