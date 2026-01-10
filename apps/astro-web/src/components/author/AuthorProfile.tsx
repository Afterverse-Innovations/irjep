"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, Mail, GraduationCap, BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { withConvex } from "@/components/ConvexClientProvider";

function AuthorProfileInner({ id }: { id: string }) {
    const author = useQuery(api.users.getAuthorById, { userId: id as any });
    const articlesOriginal = useQuery(api.users.getAuthorArticles, { authorId: id as any });

    if (author === undefined || articlesOriginal === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-200 h-10 w-10" /></div>;
    }

    if (!author) {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-stone-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">Author Not Found</h2>
                <Button variant="outline" asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-12">
                {/* Sidebar Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="aspect-square bg-stone-100 rounded-3xl flex items-center justify-center text-stone-300 border border-stone-200 shadow-inner">
                        <GraduationCap size={80} strokeWidth={1} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">{author.name}</h1>
                        <p className="text-stone-500 mt-1 capitalize font-medium tracking-wide">{author.role} Scholar</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-stone-100">
                        <div className="flex items-center gap-3 text-stone-600">
                            <Mail size={18} className="text-stone-400" />
                            <span className="text-sm font-medium">{author.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-600">
                            <GraduationCap size={18} className="text-stone-400" />
                            <span className="text-sm font-medium">{author.institution || "Independent Researcher"}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 border-b pb-2">Biography</h2>
                        <p className="text-stone-700 leading-relaxed italic bg-stone-50/50 p-6 rounded-2xl border border-stone-100 font-serif">
                            {author.bio || "No biography provided."}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-2">
                            <BookOpen size={14} /> Published Articles
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {articlesOriginal.length === 0 ? (
                                <div className="col-span-full p-12 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 text-stone-400 font-serif italic">
                                    No published articles found for this author.
                                </div>
                            ) : (
                                articlesOriginal.map((article: any) => (
                                    <div key={article._id} className="p-8 bg-white border border-stone-100 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col">
                                        <div className="flex-1">
                                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Research Paper</span>
                                            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors leading-snug">
                                                <Link href={`/articles/${article._id}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>
                                            <p className="text-xs text-stone-500 line-clamp-3 mb-6 leading-relaxed">
                                                {article.abstract}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium pt-4 border-t border-stone-50">
                                            <span className="uppercase tracking-tighter font-bold">{new Date(article.updatedAt || article._creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                            <Link href={`/articles/${article._id}`} className="text-stone-900 hover:text-emerald-700 font-bold uppercase tracking-widest flex items-center gap-1 group/btn transition-colors">
                                                View Paper <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export const AuthorProfile = withConvex(AuthorProfileInner);
