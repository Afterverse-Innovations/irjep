"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Eye, Send, Lock, Unlock, Settings2 } from "lucide-react";
import { IssueDialog } from "./issue-dialog";
import { AssignPaperDialog } from "./assign-paper-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";

function ManageIssuesInner() {
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

    if (issues === undefined) return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-200 h-10 w-10" /></div>;

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">Journal Archives</h1>
                    <p className="text-stone-500 font-medium tracking-wide">Orchestrate volumes, issues, and paper assignments.</p>
                </div>
                <IssueDialog />
            </div>

            <div className="bg-white rounded-lg border border-stone-100 shadow-sm overflow-hidden p-2">
                <Table>
                    <TableHeader className="bg-stone-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Issue Identity</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Structure</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Schedule</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">State</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-stone-300 space-y-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                                            <Calendar className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="font-serif italic text-lg text-stone-400">No issues found in archives.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue: any) => (
                                <TableRow key={issue._id} className="hover:bg-stone-50/50 border-stone-50 transition-all duration-300 group">
                                    <TableCell className="py-6 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-serif font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors">{issue.title}</span>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Journal Issue</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-6">
                                        <span className="text-sm font-medium text-stone-600">Volume {issue.volume}, No {issue.issueNumber}</span>
                                    </TableCell>
                                    <TableCell className="py-6 px-6">
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-stone-500">{issue.publicationDate}</span>
                                    </TableCell>
                                    <TableCell className="py-6 px-6">
                                        <Badge variant={issue.isPublished ? "default" : "outline"} className={`font-bold text-[9px] uppercase tracking-widest py-0.5 px-3 rounded-md shadow-none ${issue.isPublished ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-stone-200 text-stone-400"}`}>
                                            {issue.isPublished ? "Live" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right py-6 px-6">
                                        <div className="flex justify-end gap-3">
                                            <Button variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest border-stone-100 hover:bg-stone-50 transition-all" onClick={() => setAssigningIssueId(issue._id)}>
                                                <Settings2 size={12} className="mr-1.5" /> Contents
                                            </Button>
                                            <Button
                                                variant={issue.isPublished ? "outline" : "default"}
                                                size="sm"
                                                className={`h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${issue.isPublished ? 'border-stone-100 hover:bg-stone-50' : 'bg-stone-900 text-white'}`}
                                                onClick={() => handleTogglePublish(issue._id, issue.isPublished)}
                                            >
                                                {issue.isPublished ? <Lock size={12} className="mr-1.5" /> : <Send size={12} className="mr-1.5" />}
                                                {issue.isPublished ? "Private" : "Publish"}
                                            </Button>
                                        </div>
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

export const ManageIssues = withConvex(ManageIssuesInner);
