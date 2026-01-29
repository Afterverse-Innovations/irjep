"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, FileText, Download, Share2, Printer, Calendar, User, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link } from "@/components/ui/link";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";

function ArticleContentInner({ id }: { id: string }) {
    const article = useQuery(api.articles.getArticleById, { articleId: id as any });
    const trackView = useMutation(api.articles.trackView);
    const trackDownload = useMutation(api.articles.trackDownload);
    const latestArticles = useQuery(api.articles.getLatestArticles);
    const fileUrl = useQuery(api.files.getUrl, article?.fileId ? { storageId: article.fileId } : undefined);

    useEffect(() => {
        if (article?._id) {
            trackView({ articleId: article._id });
        }
    }, [article?._id, trackView]);

    const handleDownload = () => {
        if (article?._id && fileUrl) {
            // Track download asynchronously (don't await to avoid popup blockers)
            trackDownload({ articleId: article._id }).catch(err => console.error("Tracking error:", err));
            window.open(fileUrl, "_blank");
        } else {
            toast.error("File not available for download.");
        }
    };

    if (article === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300 h-8 w-8" /></div>;
    }

    if (!article) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-stone-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">Paper Not Found</h2>
                <p className="text-stone-500">The article you are looking for might have been moved or removed.</p>
                <Button variant="outline" asChild>
                    <Link href="/issues">Return to Archive</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <nav className="mb-8 flex items-center text-xs text-stone-400 gap-2 overflow-x-auto whitespace-nowrap pb-2">
                <Link href="/issues" className="hover:text-stone-900 transition-colors">Issues</Link>
                <span>/</span>
                <span className="text-stone-900">Research Paper</span>
                <span>/</span>
                <span className="truncate max-w-[200px]">{article.title}</span>
            </nav>

            <header className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {article.issueTitle || "Latest Research"}
                    </span>
                    {article.doi && (
                        <span className="text-[10px] font-mono text-stone-400">DOI: {article.doi}</span>
                    )}
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-8">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600 mb-8 pb-8 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-stone-400" />
                        <span className="font-medium text-stone-900">
                            {article.authorId ? (
                                <Link href={`/author/${article.authorId}`} className="hover:text-emerald-700 hover:underline transition-colors">
                                    {article.authors?.join(", ")}
                                </Link>
                            ) : (
                                article.authors?.join(", ")
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-stone-400" />
                        <span>Published: {new Date(article.publishDate || article.updatedAt || article._creationTime).toLocaleDateString("en-US", { month: 'long', year: 'numeric', day: 'numeric' })}</span>
                    </div>
                    {article.pageRange && (
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-stone-400" />
                            <span>Pages: {article.pageRange}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        className="bg-stone-900 text-white hover:bg-stone-800"
                        onClick={handleDownload}
                        disabled={!article.fileId || (article.fileId && !fileUrl)}
                    >
                        {article.fileId && !fileUrl ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" /> Fetching PDF...
                            </>
                        ) : (
                            <>
                                <Download size={16} className="mr-2" /> Download PDF
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        console.log("ArticleContent: Share button clicked");
                        const url = window.location.href;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url).then(() => {
                                toast.success("Link copied to clipboard");
                            }).catch(err => {
                                console.error("Clipboard error:", err);
                                toast.error("Could not copy link automatically");
                            });
                        } else {
                            // Fallback for non-secure contexts or old browsers
                            const textArea = document.createElement("textarea");
                            textArea.value = url;
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                                document.execCommand('copy');
                                toast.success("Link copied to clipboard");
                            } catch (err) {
                                console.error("Fallback copy error:", err);
                                toast.error("Please copy the URL from your browser address bar");
                            }
                            document.body.removeChild(textArea);
                        }
                    }}>
                        <Share2 size={16} className="mr-2" /> Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                </div>
            </header>

            <div className="grid md:grid-cols-4 gap-12">
                <div className="md:col-span-3 space-y-10">
                    <section>
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 border-b pb-2">Abstract</h2>
                        <p className="text-stone-700 leading-relaxed text-lg italic bg-stone-50/50 p-6 rounded-xl border border-stone-100 font-serif">
                            {article.abstract}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 border-b pb-2">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {article.keywords?.length ? article.keywords.map((kw: string) => (
                                <span key={kw} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-default">
                                    {kw}
                                </span>
                            )) : (
                                <span className="text-stone-400 text-xs italic">No keywords specified.</span>
                            )}
                        </div>
                    </section>

                    <section className="pt-8 border-t border-stone-100">
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">How to cite</h2>
                        <div className="bg-stone-50 p-4 rounded-lg text-xs text-stone-500 leading-relaxed font-mono">
                            {article.authors?.[0]} et al. ({new Date(article.publishDate || article.updatedAt || article._creationTime).getFullYear()}). &ldquo;{article.title}&rdquo;. IRJEP, {article.issueTitle || "In Press"}, {article.pageRange ? `pp. ${article.pageRange}` : "Early Access"}.
                        </div>
                    </section>
                </div>

                <aside className="md:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 size={16} className="text-stone-400" />
                                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Metrics</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Views</span>
                                    <span className="text-2xl font-serif font-bold text-stone-900">{(article.views || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Downloads</span>
                                    <span className="text-2xl font-serif font-bold text-stone-900">{(article.downloads || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-stone-900 mb-6 uppercase tracking-wider border-b border-stone-100 pb-2">Latest Research</h3>
                            <ul className="space-y-6">
                                {latestArticles?.filter((a: any) => a._id !== article._id).slice(0, 3).map((rel: any) => (
                                    <li key={rel._id} className="group">
                                        <Link href={`/articles/${rel._id}`} className="block">
                                            <h4 className="text-sm font-serif font-bold text-stone-800 group-hover:text-emerald-700 transition-colors leading-snug mb-1">
                                                {rel.title}
                                            </h4>
                                            <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                                                {new Date(rel.publishDate || rel._creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export const ArticleContent = withConvex(ArticleContentInner);
