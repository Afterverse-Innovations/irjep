"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText, Calendar, User, AlignLeft, Download } from "lucide-react";
import { Link } from "@/components/ui/link";
import { withConvex } from "@/components/ConvexClientProvider";

interface SubmissionDetailsProps {
    id: string;
}

function SubmissionDetailsInner({ id }: SubmissionDetailsProps) {
    const submission = useQuery(api.submissions.getById, { id: id as any });
    const author = useQuery(api.users.getAuthorById, { userId: submission?.authorId as any });
    const fileUrl = useQuery(api.files.getUrl, submission?.fileId ? { storageId: submission.fileId } : undefined);

    const handleDownload = () => {
        if (fileUrl) {
            window.open(fileUrl, "_blank");
        }
    };

    if (submission === undefined) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-stone-300">
                <Loader2 className="animate-spin mr-2 h-8 w-8" />
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-xl font-serif text-stone-500">Submission not found</p>
                <Link href="/dashboard/submissions">
                    <Button variant="outline">Back to Submissions</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/dashboard/submissions" className="inline-flex items-center text-stone-400 hover:text-stone-900 transition-colors group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back to Submissions</span>
            </Link>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <StatusBadge status={submission.status} />
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Version {submission.version}</span>
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-stone-900 leading-tight">{submission.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-stone-100">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Author</p>
                            <p className="text-stone-900 font-medium">{author?.name || "Loading..."}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Submitted On</p>
                            <p className="text-stone-900 font-medium">
                                {new Date(submission.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                            <FileText size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">File Status</p>
                            <p className="text-stone-900 font-medium">{submission.fileId ? "Uploaded" : "No file attached"}</p>
                        </div>
                    </div>

                    <div className="flex items-end justify-end">
                        {submission.fileId && (
                            <Button
                                className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white rounded-lg"
                                onClick={handleDownload}
                                disabled={!fileUrl}
                            >
                                {fileUrl ? (
                                    <>
                                        <Download size={16} className="mr-2" /> Download Manuscript
                                    </>
                                ) : (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" /> Fetching link...
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-stone-400">
                            <AlignLeft size={16} />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest">Abstract</h2>
                        </div>
                        <div className="prose prose-stone max-w-none">
                            <p className="text-stone-600 leading-relaxed font-serif text-lg italic">
                                {submission.abstract}
                            </p>
                        </div>
                    </div>

                    {submission.keywords && submission.keywords.length > 0 && (
                        <div className="space-y-3 pt-6">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Keywords</h2>
                            <div className="flex flex-wrap gap-2">
                                {submission.keywords.map((keyword: string) => (
                                    <Badge key={keyword} variant="secondary" className="bg-stone-100 text-stone-600 hover:bg-stone-200 border-none px-3 py-1">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: "bg-stone-100 text-stone-600 border-stone-200",
        submitted: "bg-sky-50 text-sky-700 border-sky-100",
        under_review: "bg-amber-50 text-amber-700 border-amber-100",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
        rejected: "bg-rose-50 text-rose-700 border-rose-100",
        published: "bg-indigo-50 text-indigo-700 border-indigo-100",
    };

    return (
        <Badge variant="outline" className={`${styles[status] || styles.draft} font-bold text-[9px] uppercase tracking-widest py-1 px-3 rounded-md border shadow-none`}>
            {status.replace("_", " ")}
        </Badge>
    );
}

export const SubmissionDetails = withConvex(SubmissionDetailsInner);
