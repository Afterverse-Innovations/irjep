"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2, FileText, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SubmissionDetailsPage() {
    const { id } = useParams();
    // For now we don't have a specific getSubmissionById, but we can filter from mySubmissions or add one.
    // Let's assume we have it or use a query that returns it.
    const submissions = useQuery(api.submissions.getMySubmissions);
    const submission = submissions?.find((s: any) => s._id === id);

    if (submissions === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300" /></div>;
    }

    if (!submission) {
        return (
            <div className="p-16 text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold">Submission Not Found</h1>
                <Button asChild variant="outline">
                    <Link href="/dashboard/submissions">Back to My Submissions</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <Link href="/dashboard/submissions" className="flex items-center text-sm text-stone-500 hover:text-stone-900 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to My Submissions
            </Link>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-stone-100 bg-stone-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <StatusBadge status={submission.status} />
                        <span className="text-xs text-stone-400 font-mono italic">ID: {submission._id}</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">
                        {submission.title}
                    </h1>
                </div>

                <div className="p-8 space-y-10">
                    <section>
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Abstract</h2>
                        <p className="text-stone-700 leading-relaxed text-lg italic bg-stone-50 p-6 rounded-xl border border-stone-100">
                            {submission.abstract}
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-stone-50">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Metadata</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-stone-600">
                                    <Calendar size={16} className="text-stone-300" />
                                    <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-stone-600">
                                    <Clock size={16} className="text-stone-300" />
                                    <span>Last Update: {new Date(submission.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Files</h3>
                            {submission.fileId ? (
                                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-emerald-600" />
                                        <span className="text-sm font-medium text-stone-700">Paper.pdf</span>
                                    </div>
                                    <Button size="sm" variant="ghost">Download</Button>
                                </div>
                            ) : (
                                <p className="text-xs text-stone-400 italic">No files uploaded for this version.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 text-center">Review Timeline</h3>
                        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                            <div className="relative">
                                <span className={`absolute left-[-25px] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ${submission.status === 'published' ? 'ring-indigo-500 bg-indigo-500' : 'ring-stone-200 bg-stone-200'}`}></span>
                                <div className="text-sm">
                                    <p className="font-semibold text-stone-900">Step 1: Initial Submission</p>
                                    <p className="text-stone-500">Successfully received by editorial desk.</p>
                                    <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">Completed {new Date(submission.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className={`absolute left-[-25px] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ${['under_review', 'accepted', 'published', 'rejected'].includes(submission.status) ? 'ring-amber-500 bg-amber-500' : 'ring-stone-100 bg-stone-100'}`}></span>
                                <div className="text-sm">
                                    <p className="font-semibold text-stone-900">Step 2: Peer Review</p>
                                    <p className="text-stone-500">Assignment of reviewers and technical evaluation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: "bg-stone-100 text-stone-600 border-stone-200",
        submitted: "bg-blue-50 text-blue-700 border-blue-200",
        under_review: "bg-amber-50 text-amber-700 border-amber-200",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        published: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
        <Badge variant="outline" className={`${styles[status] || styles.draft} px-3 py-1 text-xs font-semibold uppercase tracking-wider`}>
            {status.replace("_", " ")}
        </Badge>
    );
}
