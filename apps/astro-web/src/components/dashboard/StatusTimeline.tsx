"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { StatusBadge } from "./StatusBadge";
import { CorrectionModal } from "./CorrectionModal";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Paperclip, Clock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusTimelineProps {
    submissionId: string;
    /** The current status of the submission — used to decide whether to show the correction button */
    currentStatus?: string;
    /** Whether the current viewer is the author of this submission */
    isAuthor?: boolean;
}

export function StatusTimeline({
    submissionId,
    currentStatus,
    isAuthor,
}: StatusTimelineProps) {
    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);

    const history = useQuery(api.statusHistory.getBySubmission, {
        submissionId: submissionId as any,
    });

    if (history === undefined) {
        return (
            <div className="flex items-center justify-center py-16 text-stone-300">
                <Loader2 className="animate-spin h-6 w-6" />
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 space-y-3">
                <Clock size={32} className="opacity-30" />
                <p className="font-serif italic text-lg">No history recorded yet.</p>
            </div>
        );
    }

    // Show correction button if the *current* status is requested_for_correction
    // and the latest history entry matches, and the viewer is the author
    const showCorrectionButton =
        isAuthor && currentStatus === "requested_for_correction";

    return (
        <>
            <div className="relative space-y-0">
                {/* Vertical connecting line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-stone-100" />

                {history.map((entry: any, index: number) => {
                    const isLatest = index === history.length - 1;
                    const isCorrectionRequest =
                        entry.newStatus === "requested_for_correction";

                    // Show button on the latest "requested_for_correction" card
                    const showButtonOnThisCard =
                        showCorrectionButton && isCorrectionRequest && isLatest;

                    return (
                        <div key={entry._id} className="relative flex gap-5 group">
                            {/* Timeline node */}
                            <div className="relative z-10 flex flex-col items-center pt-1">
                                <div
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isLatest
                                            ? "bg-emerald-50 border-emerald-300 shadow-sm shadow-emerald-100"
                                            : "bg-white border-stone-200"
                                        }`}
                                >
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full ${isLatest
                                                ? "bg-emerald-500"
                                                : "bg-stone-300"
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Content card */}
                            <div
                                className={`flex-1 ${isLatest ? "pb-0" : "pb-8"}`}
                            >
                                <div
                                    className={`rounded-xl border p-5 transition-all duration-300 ${isLatest
                                            ? "bg-white border-emerald-100 shadow-sm"
                                            : "bg-stone-50/50 border-stone-100 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    {/* Header */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <StatusBadge status={entry.newStatus} size="sm" />
                                        {entry.previousStatus && (
                                            <span className="text-[9px] text-stone-400 font-medium uppercase tracking-wider">
                                                from{" "}
                                                <span className="font-bold">
                                                    {entry.previousStatus.replace(/_/g, " ")}
                                                </span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Note */}
                                    <p className="text-sm text-stone-700 leading-relaxed mb-3">
                                        {entry.note}
                                    </p>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold uppercase tracking-widest">
                                                {entry.changedByName}
                                            </span>
                                            <RoleBadge role={entry.changedByRole} />
                                        </div>
                                        <span className="text-stone-200">•</span>
                                        <time className="font-medium uppercase tracking-wider">
                                            {formatDateTime(entry.createdAt)}
                                        </time>
                                    </div>

                                    {/* Attachment */}
                                    {entry.attachmentUrl && (
                                        <div className="mt-3 pt-3 border-t border-stone-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-[10px] font-bold uppercase tracking-widest rounded-lg h-8 gap-1.5 text-stone-600 hover:text-stone-900 border-stone-200"
                                                onClick={() => window.open(entry.attachmentUrl, "_blank")}
                                            >
                                                <Paperclip size={12} />
                                                Download Attachment
                                                <Download size={10} />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Upload Correction CTA — only on the latest "requested_for_correction" card for authors */}
                                    {showButtonOnThisCard && (
                                        <div className="mt-4 pt-4 border-t border-orange-100">
                                            <Button
                                                onClick={() => setCorrectionModalOpen(true)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-9 px-5 text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-orange-200 transition-all"
                                            >
                                                <Upload size={14} className="mr-2" />
                                                Upload Correction
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Correction Modal */}
            {showCorrectionButton && (
                <CorrectionModal
                    submissionId={submissionId}
                    open={correctionModalOpen}
                    onOpenChange={setCorrectionModalOpen}
                />
            )}
        </>
    );
}

function RoleBadge({ role }: { role: string }) {
    const config: Record<string, string> = {
        editor: "bg-indigo-50 text-indigo-600 border-indigo-100",
        author: "bg-amber-50 text-amber-600 border-amber-100",
        system: "bg-stone-100 text-stone-500 border-stone-200",
    };

    return (
        <Badge
            variant="outline"
            className={`${config[role] || config.system} text-[8px] font-bold uppercase tracking-widest py-0 px-1.5 rounded border shadow-none`}
        >
            {role}
        </Badge>
    );
}

function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relative = "";
    if (diffMins < 1) relative = "Just now";
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = "";

    const absolute = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return relative ? `${relative} · ${absolute}` : absolute;
}
