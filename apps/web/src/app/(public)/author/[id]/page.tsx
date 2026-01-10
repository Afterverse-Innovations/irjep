"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2, Mail, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuthorProfilePage() {
    const { id } = useParams();
    const author = useQuery(api.users.getAuthorById, { userId: id as any });
    const articlesOriginal = useQuery(api.users.getAuthorArticles, { authorId: id as any });

    if (author === undefined || articlesOriginal === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!author) {
        return <div className="p-16 text-center text-stone-500 font-serif text-2xl">Author Not Found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-12">
                {/* Sidebar Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="aspect-square bg-stone-200 rounded-2xl flex items-center justify-center text-stone-400">
                        <GraduationCap size={80} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900">{author.name}</h1>
                        <p className="text-stone-500 mt-1 capitalize">{author.role} Scholar</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-stone-100">
                        <div className="flex items-center gap-3 text-stone-600">
                            <Mail size={18} />
                            <span className="text-sm">{author.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-600">
                            <GraduationCap size={18} />
                            <span className="text-sm">{author.institution || "Independent Researcher"}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 border-b pb-2">Biography</h2>
                        <p className="text-stone-700 leading-relaxed italic">
                            {author.bio || "No biography provided."}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-stone-400" /> Published Articles
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {articlesOriginal.length === 0 ? (
                                <div className="col-span-full p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-400">
                                    No published articles found for this author.
                                </div>
                            ) : (
                                articlesOriginal.map((article: any) => (
                                    <Card key={article._id} className="flex flex-col hover:shadow-lg transition-all duration-300 border-stone-100 group">
                                        <CardHeader className="flex-1 pb-2">
                                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 self-start">Research Paper</span>
                                            <CardTitle className="font-serif text-lg text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                                <Link href={`/articles/${article._id}`}>
                                                    {article.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-stone-500 line-clamp-3 mb-6 leading-relaxed">
                                                {article.abstract}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium pt-4 border-t border-stone-50">
                                                <span className="uppercase tracking-tighter font-bold">{new Date(article.updatedAt || article._creationTime).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                                <Link href={`/articles/${article._id}`} className="text-stone-900 hover:text-emerald-700 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    View Details <ArrowRight size={10} />
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
