"use client";

import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ExternalLink, Clock, Plus } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { withConvex } from "@/components/ConvexClientProvider";

function SubmissionsListInner() {
    const submissions = useQuery(api.submissions.getMySubmissions);

    if (submissions === undefined) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-stone-300">
                <Loader2 className="animate-spin mr-2 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">My Submissions</h1>
                    <p className="text-stone-500 font-medium tracking-wide">Track and manage your research papers in the pipeline.</p>
                </div>
                <Link href="/submit">
                    <Button className="rounded-lg h-11 px-6 bg-stone-900 group">
                        <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" /> New Submission
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-stone-100 shadow-sm overflow-hidden p-2">
                <Table>
                    <TableHeader className="bg-stone-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="w-[450px] font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Paper Title</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Status</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Submitted On</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-stone-300 space-y-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                                            <FileText className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="font-serif italic text-lg">You haven&apos;t submitted any papers yet.</p>
                                        <Link href="/submit" className="text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-widest text-[10px] hover:underline underline-offset-4">Start your first submission</Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub: any) => (
                                <TableRow key={sub._id} className="hover:bg-stone-50/50 border-stone-50 transition-all duration-300 group">
                                    <TableCell className="font-medium align-top py-6 px-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-stone-900 font-serif font-bold text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">{sub.title}</span>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Version {sub.version}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top py-6 px-6">
                                        <StatusBadge status={sub.status} />
                                    </TableCell>
                                    <TableCell className="text-stone-500 font-medium align-top py-6 px-6">
                                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                                            <Clock size={12} className="text-stone-300" />
                                            {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-6 px-6">
                                        <Button variant="ghost" size="sm" asChild className="rounded-lg hover:bg-stone-900 hover:text-white transition-all">
                                            <Link href={`/dashboard/submissions/${sub._id}`} className="text-[10px] font-bold uppercase tracking-widest">
                                                Details <ExternalLink size={12} className="ml-2" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
        <Badge variant="outline" className={`${styles[status] || styles.draft} font-bold text-[9px] uppercase tracking-widest py-0.5 px-2 rounded-md border shadow-none`}>
            {status.replace("_", " ")}
        </Badge>
    );
}

export const SubmissionsList = withConvex(SubmissionsListInner);
