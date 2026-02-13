"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { StatusBadge } from "./StatusBadge";
import { StatusTimeline } from "./StatusTimeline";
import { StatusChangeModal } from "./StatusChangeModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    ArrowLeft,
    FileText,
    Calendar,
    User,
    AlignLeft,
    Download,
    Mail,
    Phone,
    MapPin,
    ArrowRightLeft,
    Users,
    BookOpen,
} from "lucide-react";
import { Link } from "@/components/ui/link";
import parse from 'html-react-parser';
import { withConvex } from "@/components/ConvexClientProvider";

interface SubmissionDetailsProps {
    id: string;
}

function SubmissionDetailsInner({ id }: SubmissionDetailsProps) {
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const submission = useQuery(api.submissions.getById, { id: id as any });
    const currentUser = useQuery(api.users.viewer);
    const availableTransitions = useQuery(
        api.manuscriptLifecycle.getAvailableTransitions,
        { submissionId: id as any }
    );
    const copyrightUrl = useQuery(
        api.files.getUrl,
        submission?.copyrightFileId
            ? { storageId: submission.copyrightFileId }
            : "skip"
    );
    const manuscriptUrl = useQuery(
        api.files.getUrl,
        submission?.manuscriptFileId
            ? { storageId: submission.manuscriptFileId }
            : "skip"
    );

    if (submission === undefined || currentUser === undefined) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-stone-300">
                <Loader2 className="animate-spin mr-2 h-8 w-8" />
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-xl font-serif text-stone-500">
                    Submission not found
                </p>
                <Link href="/dashboard/submissions">
                    <Button variant="outline">Back to Submissions</Button>
                </Link>
            </div>
        );
    }

    const isEditor =
        currentUser?.role === "editor" || currentUser?.role === "admin";
    const isAuthor = submission.authorId === currentUser?._id;
    const canChangeStatus =
        availableTransitions && availableTransitions.length > 0;

    // Back link depends on role
    const backLink = isEditor ? "/dashboard/queue" : "/dashboard/submissions";
    const backLabel = isEditor ? "All Submissions" : "My Submissions";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back navigation */}
            <Link
                href={backLink}
                className="inline-flex items-center text-stone-400 hover:text-stone-900 transition-colors group"
            >
                <ArrowLeft
                    size={16}
                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    Back to {backLabel}
                </span>
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={submission.status} />
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            Version {submission.version}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                        {submission.title}
                    </h1>
                </div>
                {canChangeStatus && (
                    <Button
                        onClick={() => setStatusModalOpen(true)}
                        className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg h-10 px-5 text-[10px] font-bold uppercase tracking-widest shrink-0"
                    >
                        <ArrowRightLeft size={14} className="mr-2" />
                        Change Status
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details" className="text-[11px] font-bold uppercase tracking-widest">
                        <FileText size={14} className="mr-1.5" />
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="text-[11px] font-bold uppercase tracking-widest">
                        <BookOpen size={14} className="mr-1.5" />
                        Timeline
                    </TabsTrigger>
                </TabsList>

                {/* ═══ TAB 1: Submission Details ═══ */}
                <TabsContent value="details">
                    <div className="space-y-8">
                        {/* Meta cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-stone-100">
                            <MetaItem
                                icon={<User size={18} />}
                                label="Author"
                                value={
                                    <Link
                                        href={`/author/${submission.authorId}`}
                                        className="hover:text-emerald-700 hover:underline transition-colors"
                                    >
                                        {submission.authorName || "Loading…"}
                                    </Link>
                                }
                            />
                            <MetaItem
                                icon={<Calendar size={18} />}
                                label="Submitted On"
                                value={new Date(submission.createdAt).toLocaleDateString(
                                    "en-US",
                                    { month: "long", day: "numeric", year: "numeric" }
                                )}
                            />
                            <MetaItem
                                icon={<Calendar size={18} />}
                                label="Last Updated"
                                value={new Date(submission.updatedAt).toLocaleDateString(
                                    "en-US",
                                    { month: "long", day: "numeric", year: "numeric" }
                                )}
                            />
                        </div>

                        {/* Article Type */}
                        {submission.articleType && (
                            <div className="space-y-2">
                                <SectionLabel icon={<FileText size={16} />}>
                                    Article Type
                                </SectionLabel>
                                <p className="text-stone-700 font-medium">
                                    {submission.articleType}
                                </p>
                            </div>
                        )}

                        {/* Abstract */}
                        <div className="space-y-3">
                            <SectionLabel icon={<AlignLeft size={16} />}>
                                Abstract
                            </SectionLabel>
                            <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed font-serif">
                                {parse(submission.abstract || "")}
                            </div>
                        </div>

                        {/* Keywords */}
                        {submission.keywords && submission.keywords.length > 0 && (
                            <div className="space-y-3">
                                <SectionLabel>Keywords</SectionLabel>
                                <div className="flex flex-wrap gap-2">
                                    {submission.keywords.map((keyword: string) => (
                                        <Badge
                                            key={keyword}
                                            variant="secondary"
                                            className="bg-stone-100 text-stone-600 hover:bg-stone-200 border-none px-3 py-1"
                                        >
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Corresponding Author */}
                        {submission.correspondingAuthor && (
                            <div className="space-y-3">
                                <SectionLabel icon={<Mail size={16} />}>
                                    Corresponding Author
                                </SectionLabel>
                                <div className="bg-stone-50 rounded-xl border border-stone-100 p-5 space-y-2">
                                    <p className="font-medium text-stone-900">
                                        {submission.correspondingAuthor.name}
                                    </p>
                                    <div className="flex flex-col gap-1.5 text-sm text-stone-500">
                                        <span className="flex items-center gap-2">
                                            <Mail size={12} className="text-stone-400" />
                                            {submission.correspondingAuthor.email}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Phone size={12} className="text-stone-400" />
                                            {submission.correspondingAuthor.phone}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <MapPin size={12} className="text-stone-400" />
                                            {submission.correspondingAuthor.address}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Research Authors */}
                        {submission.researchAuthors &&
                            submission.researchAuthors.length > 0 && (
                                <div className="space-y-3">
                                    <SectionLabel icon={<Users size={16} />}>
                                        Research Authors
                                    </SectionLabel>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {submission.researchAuthors.map(
                                            (author: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="bg-stone-50 rounded-xl border border-stone-100 p-4"
                                                >
                                                    <p className="font-medium text-stone-900 text-sm">
                                                        {author.name}
                                                    </p>
                                                    <p className="text-[11px] text-stone-400 mt-1">
                                                        {author.affiliation}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Files */}
                        <div className="space-y-3">
                            <SectionLabel icon={<FileText size={16} />}>Files</SectionLabel>
                            <div className="flex flex-wrap gap-3">
                                {submission.manuscriptFileId && (
                                    <Button
                                        variant="outline"
                                        className="rounded-lg text-[10px] font-bold uppercase tracking-widest h-9 border-stone-200 hover:bg-stone-900 hover:text-white transition-all"
                                        onClick={() =>
                                            manuscriptUrl && window.open(manuscriptUrl, "_blank")
                                        }
                                        disabled={!manuscriptUrl}
                                    >
                                        {manuscriptUrl ? (
                                            <>
                                                <Download size={14} className="mr-2" />
                                                Download Manuscript
                                            </>
                                        ) : (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="mr-2 animate-spin"
                                                />
                                                Fetching…
                                            </>
                                        )}
                                    </Button>
                                )}
                                {submission.copyrightFileId && (
                                    <Button
                                        variant="outline"
                                        className="rounded-lg text-[10px] font-bold uppercase tracking-widest h-9 border-stone-200 hover:bg-stone-900 hover:text-white transition-all"
                                        onClick={() =>
                                            copyrightUrl && window.open(copyrightUrl, "_blank")
                                        }
                                        disabled={!copyrightUrl}
                                    >
                                        {copyrightUrl ? (
                                            <>
                                                <Download size={14} className="mr-2" />
                                                Copyright Form
                                            </>
                                        ) : (
                                            <>
                                                <Loader2
                                                    size={14}
                                                    className="mr-2 animate-spin"
                                                />
                                                Fetching…
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ═══ TAB 2: Timeline ═══ */}
                <TabsContent value="timeline">
                    <div className="bg-white rounded-xl border border-stone-100 p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-serif font-bold text-stone-900">
                                Status History
                            </h2>
                            <p className="text-sm text-stone-500 mt-1">
                                Complete audit trail of all status changes for this manuscript.
                            </p>
                        </div>
                        <StatusTimeline submissionId={id} currentStatus={submission.status} isAuthor={isAuthor} />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Status Change Modal */}
            <StatusChangeModal
                submissionId={id}
                currentStatus={submission.status}
                open={statusModalOpen}
                onOpenChange={setStatusModalOpen}
            />
        </div>
    );
}

function MetaItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                    {label}
                </p>
                <p className="text-stone-900 font-medium">{value}</p>
            </div>
        </div>
    );
}

function SectionLabel({
    icon,
    children,
}: {
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 text-stone-400">
            {icon}
            <h2 className="text-[10px] font-bold uppercase tracking-widest">
                {children}
            </h2>
        </div>
    );
}

export const SubmissionDetails = withConvex(SubmissionDetailsInner);
