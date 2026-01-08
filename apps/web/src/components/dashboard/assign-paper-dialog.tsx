"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AssignPaperDialogProps {
    issueId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AssignPaperDialog({ issueId, isOpen, onClose }: AssignPaperDialogProps) {
    const [view, setView] = useState<"available" | "assigned">("available");
    const acceptedSubmissions = useQuery(api.submissions.getAcceptedSubmissions);
    const assignedArticles = useQuery(api.articles.getArticlesByIssue, { issueId: issueId as any });

    const assignToIssue = useMutation(api.articles.assignToIssue);
    const removeFromIssue = useMutation(api.articles.removeFromIssue);
    const [isLoading, setIsLoading] = useState(false);

    const handleAssign = async (submissionId: any) => {
        setIsLoading(true);
        try {
            await assignToIssue({
                submissionId,
                issueId: issueId as any,
            });
            toast.success("Paper assigned to issue");
        } catch (error) {
            toast.error("Failed to assign paper");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (articleId: any) => {
        setIsLoading(true);
        try {
            await removeFromIssue({ articleId });
            toast.success("Paper removed from issue");
        } catch (error) {
            toast.error("Failed to remove paper");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Issue Content</DialogTitle>
                    <DialogDescription>
                        Assign new papers or remove existing ones from this issue.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-1 p-1 bg-stone-100 rounded-lg mb-4">
                    <button
                        onClick={() => setView("available")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'available' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        Available Papers
                    </button>
                    <button
                        onClick={() => setView("assigned")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'assigned' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        Currently Assigned ({assignedArticles?.length ?? 0})
                    </button>
                </div>

                <div className="py-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {view === "available" ? (
                        acceptedSubmissions === undefined ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-stone-300" /></div>
                        ) : acceptedSubmissions.length === 0 ? (
                            <div className="text-center py-12 text-stone-400">
                                <Plus className="h-8 w-8 mx-auto mb-2 opacity-10" />
                                <p className="text-sm">No new accepted papers ready for assignment.</p>
                            </div>
                        ) : (
                            acceptedSubmissions.map((sub: any) => (
                                <div key={sub._id} className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                    <div className="flex-1 mr-4">
                                        <h4 className="font-medium text-stone-900 line-clamp-1">{sub.title}</h4>
                                        <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Accepted</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleAssign(sub._id)} disabled={isLoading}>
                                        Assign
                                    </Button>
                                </div>
                            ))
                        )
                    ) : (
                        assignedArticles === undefined ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-stone-300" /></div>
                        ) : assignedArticles.length === 0 ? (
                            <div className="text-center py-12 text-stone-400">
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-10" />
                                <p className="text-sm">This issue doesn&apos;t have any papers yet.</p>
                            </div>
                        ) : (
                            assignedArticles.map((article: any) => (
                                <div key={article._id} className="flex items-center justify-between p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl">
                                    <div className="flex-1 mr-4">
                                        <h4 className="font-medium text-stone-900 line-clamp-1">{article.title}</h4>
                                        <div className="flex gap-2 mt-1">
                                            {article.authors.map((a: string) => (
                                                <span key={a} className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                                    {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={() => handleRemove(article._id)} disabled={isLoading}>
                                        Remove
                                    </Button>
                                </div>
                            ))
                        )
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t border-stone-100">
                    <Button variant="ghost" onClick={onClose}>Finished</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
