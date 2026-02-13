"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Loader2, AlertCircle, Clock, ExternalLink, FileText } from "lucide-react";
import { Link } from "@/components/ui/link";
import { withConvex } from "@/components/ConvexClientProvider";

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending_for_review", label: "Pending" },
    { value: "under_peer_review", label: "Under Review" },
    { value: "requested_for_correction", label: "Corrections" },
    { value: "correction_submitted", label: "Corrected" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "pre_publication", label: "Pre-Pub" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
] as const;

function ReviewQueueInner() {
    const [activeFilter, setActiveFilter] = useState("all");

    const allSubmissions = useQuery(api.submissions.getAllSubmissions, {});
    const user = useQuery(api.users.viewer);

    const filteredSubmissions = useMemo(() => {
        if (!allSubmissions) return [];
        if (activeFilter === "all") return allSubmissions;
        return allSubmissions.filter((sub: any) => sub.status === activeFilter);
    }, [allSubmissions, activeFilter]);

    // Get counts for each filter
    const statusCounts = useMemo(() => {
        if (!allSubmissions) return {};
        const counts: Record<string, number> = { all: allSubmissions.length };
        for (const sub of allSubmissions) {
            counts[sub.status] = (counts[sub.status] || 0) + 1;
        }
        return counts;
    }, [allSubmissions]);

    if (user === undefined || allSubmissions === undefined) {
        return (
            <div className="p-16 flex justify-center">
                <Loader2 className="animate-spin text-stone-200 h-10 w-10" />
            </div>
        );
    }

    if (user?.role === "author") {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                    Access Denied
                </h2>
                <p className="text-stone-500">
                    Only editors and admins can access the review queue.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">
                    All Submissions
                </h1>
                <p className="text-stone-500 font-medium tracking-wide">
                    Review and manage manuscripts across all lifecycle stages.
                </p>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => {
                    const count = statusCounts[filter.value] || 0;
                    const isActive = activeFilter === filter.value;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest
                transition-all duration-200 border cursor-pointer
                ${isActive
                                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                                    : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-700 hover:border-stone-300"
                                }
              `}
                        >
                            {filter.label}
                            {count > 0 && (
                                <span
                                    className={`text-[9px] rounded-full px-1.5 py-0.5 leading-none ${isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-stone-100 text-stone-400"
                                        }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Submissions table */}
            <div className="bg-white rounded-lg border border-stone-100 shadow-sm overflow-hidden p-2">
                <Table>
                    <TableHeader className="bg-stone-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="w-[400px] font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">
                                Paper Title
                            </TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">
                                Author
                            </TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">
                                Status
                            </TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">
                                Updated
                            </TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-stone-300 space-y-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                                            <FileText className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="font-serif italic text-lg text-stone-400">
                                            {activeFilter === "all"
                                                ? "No submissions found."
                                                : `No submissions with this status.`}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubmissions.map((sub: any) => (
                                <TableRow
                                    key={sub._id}
                                    className="hover:bg-stone-50/50 border-stone-50 transition-all duration-300 group cursor-pointer"
                                >
                                    <TableCell className="font-medium align-top py-5 px-6">
                                        <Link href={`/dashboard/submissions/${sub._id}`}>
                                            <span className="text-stone-900 font-serif font-bold text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                {sub.title}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="align-top py-5 px-6">
                                        <div className="flex flex-col gap-0.5">
                                            <Link
                                                href={`/author/${sub.authorId}`}
                                                className="text-sm font-medium text-stone-700 hover:text-emerald-700 transition-colors hover:underline"
                                            >
                                                {sub.authorName}
                                            </Link>
                                            <span className="text-[10px] text-stone-400">
                                                {sub.authorEmail}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top py-5 px-6">
                                        <StatusBadge status={sub.status} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-stone-500 font-medium align-top py-5 px-6">
                                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                                            <Clock size={12} className="text-stone-300" />
                                            {new Date(sub.updatedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-5 px-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="rounded-lg hover:bg-stone-900 hover:text-white transition-all"
                                        >
                                            <Link
                                                href={`/dashboard/submissions/${sub._id}`}
                                                className="text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Review{" "}
                                                <ExternalLink size={12} className="ml-2" />
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

export const ReviewQueue = withConvex(ReviewQueueInner);
