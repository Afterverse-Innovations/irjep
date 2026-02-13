"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    submitted: {
        label: "Submitted",
        className: "bg-sky-50 text-sky-700 border-sky-100",
    },
    pending_for_review: {
        label: "Pending Review",
        className: "bg-amber-50 text-amber-700 border-amber-100",
    },
    under_peer_review: {
        label: "Under Peer Review",
        className: "bg-violet-50 text-violet-700 border-violet-100",
    },
    requested_for_correction: {
        label: "Correction Requested",
        className: "bg-orange-50 text-orange-700 border-orange-100",
    },
    correction_submitted: {
        label: "Correction Submitted",
        className: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
    accepted: {
        label: "Accepted",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    rejected: {
        label: "Rejected",
        className: "bg-rose-50 text-rose-700 border-rose-100",
    },
    pre_publication: {
        label: "Pre-Publication",
        className: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    published: {
        label: "Published",
        className: "bg-green-50 text-green-700 border-green-100",
    },
    unpublished: {
        label: "Unpublished",
        className: "bg-stone-100 text-stone-600 border-stone-200",
    },
};

interface StatusBadgeProps {
    status: string;
    size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || {
        label: status.replace(/_/g, " "),
        className: "bg-stone-100 text-stone-600 border-stone-200",
    };

    const sizeClasses =
        size === "sm"
            ? "text-[8px] py-0.5 px-1.5"
            : "text-[9px] py-1 px-3";

    return (
        <Badge
            variant="outline"
            className={`${config.className} font-bold uppercase tracking-widest ${sizeClasses} rounded-md border shadow-none`}
        >
            {config.label}
        </Badge>
    );
}

/** Utility to get only the label string without rendering a badge */
export function getStatusLabel(status: string): string {
    return STATUS_CONFIG[status]?.label ?? status.replace(/_/g, " ");
}
