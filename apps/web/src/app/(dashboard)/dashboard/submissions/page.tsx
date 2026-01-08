"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

export default function MySubmissionsPage() {
    const submissions = useQuery(api.submissions.getMySubmissions);

    if (submissions === undefined) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-stone-500">
                <Loader2 className="animate-spin mr-2" /> Loading your submissions...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">My Submissions</h1>
                    <p className="text-stone-500">Track and manage your research papers.</p>
                </div>
                <Link href="/submit">
                    <Button>New Submission</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-stone-50">
                        <TableRow>
                            <TableHead className="w-[400px]">Paper Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-stone-400">
                                        <FileText className="h-10 w-10 mb-2 opacity-20" />
                                        <p>You haven&apos;t submitted any papers yet.</p>
                                        <Link href="/submit" className="text-primary hover:underline mt-2 text-sm">Start your first submission</Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub: any) => (
                                <TableRow key={sub._id} className="hover:bg-stone-50/50 transition-colors">
                                    <TableCell className="font-medium align-top py-4">
                                        <div className="flex flex-col">
                                            <span className="text-stone-900 line-clamp-2">{sub.title}</span>
                                            <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Version {sub.version}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top py-4">
                                        <StatusBadge status={sub.status} />
                                    </TableCell>
                                    <TableCell className="text-stone-500 text-sm align-top py-4">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} className="text-stone-300" />
                                            {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-4">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/submissions/${sub._id}`}>
                                                Details <ExternalLink size={14} className="ml-2" />
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
        submitted: "bg-blue-50 text-blue-700 border-blue-200",
        under_review: "bg-amber-50 text-amber-700 border-amber-200",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        published: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
        <Badge variant="outline" className={`${styles[status] || styles.draft} font-normal capitalize`}>
            {status.replace("_", " ")}
        </Badge>
    );
}

// Minimal button import for this file context if not globally available, 
// though we usually use the one from UI components
import { Button } from "@/components/ui/button";
