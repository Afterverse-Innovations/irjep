"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Eye, Send, Lock, Unlock } from "lucide-react";
import { IssueDialog } from "@/components/dashboard/issue-dialog";
import { AssignPaperDialog } from "@/components/dashboard/assign-paper-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ManageIssuesPage() {
    const issues = useQuery(api.issues.list);
    const togglePublish = useMutation(api.issues.togglePublish);
    const [assigningIssueId, setAssigningIssueId] = useState<string | null>(null);

    const handleTogglePublish = async (id: any, current: boolean) => {
        try {
            await togglePublish({ id, isPublished: !current });
            toast.success(current ? "Issue unpublished" : "Issue published successfully!");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (issues === undefined) return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Manage Issues</h1>
                    <p className="text-stone-500">Create and publish journal volumes and issues.</p>
                </div>
                <IssueDialog />
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-stone-50">
                        <TableRow>
                            <TableHead>Issue Title</TableHead>
                            <TableHead>Vol / No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-stone-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No issues created yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue: any) => (
                                <TableRow key={issue._id}>
                                    <TableCell className="font-bold font-serif text-stone-900">
                                        {issue.title}
                                    </TableCell>
                                    <TableCell>
                                        Vol {issue.volume}, No {issue.issueNumber}
                                    </TableCell>
                                    <TableCell className="text-stone-500">
                                        {issue.publicationDate}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={issue.isPublished ? "default" : "secondary"} className={issue.isPublished ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                            {issue.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setAssigningIssueId(issue._id)}>
                                            Manage Papers
                                        </Button>
                                        <Button
                                            variant={issue.isPublished ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleTogglePublish(issue._id, issue.isPublished)}
                                        >
                                            {issue.isPublished ? <Lock className="mr-2 h-3 w-3" /> : <Send className="mr-2 h-3 w-3" />}
                                            {issue.isPublished ? "Unpublish" : "Publish Now"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {assigningIssueId && (
                <AssignPaperDialog
                    issueId={assigningIssueId}
                    isOpen={true}
                    onClose={() => setAssigningIssueId(null)}
                />
            )}
        </div>
    );
}
