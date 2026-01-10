"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
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
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [pageRange, setPageRange] = useState("");
    const [doi, setDoi] = useState("");

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
                pageRange: pageRange || undefined,
                doi: doi || undefined,
            });
            toast.success("Paper assigned to issue");
            setEditingSubId(null);
            setPageRange("");
            setDoi("");
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
                                <div key={sub._id} className="p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1 mr-4">
                                            <h4 className="font-medium text-stone-900 line-clamp-1">{sub.title}</h4>
                                            <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">Accepted</p>
                                        </div>
                                        <Button size="sm" variant={editingSubId === sub._id ? "ghost" : "default"} onClick={() => setEditingSubId(editingSubId === sub._id ? null : sub._id)}>
                                            {editingSubId === sub._id ? "Cancel" : "Assign"}
                                        </Button>
                                    </div>

                                    {editingSubId === sub._id && (
                                        <div className="space-y-3 bg-stone-100/50 p-4 rounded-lg mt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-stone-500 mb-1 block">Page Range</label>
                                                    <Input
                                                        placeholder="e.g. 1-12"
                                                        className="h-8 text-xs bg-white"
                                                        value={pageRange}
                                                        onChange={(e) => setPageRange(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-stone-500 mb-1 block">DOI (Optional)</label>
                                                    <Input
                                                        placeholder="10.xxxx/xxxx"
                                                        className="h-8 text-xs bg-white"
                                                        value={doi}
                                                        onChange={(e) => setDoi(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <Button className="w-full h-8 text-xs" onClick={() => handleAssign(sub._id)} disabled={isLoading}>
                                                Confirm Assignment
                                            </Button>
                                        </div>
                                    )}
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
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex gap-1">
                                                {article.authors.map((a: string) => (
                                                    <span key={a} className="text-[9px] text-emerald-700 bg-emerald-100/50 px-1 py-0.5 rounded uppercase font-bold tracking-tighter">
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>
                                            {article.pageRange && (
                                                <span className="text-[9px] text-stone-400 font-mono">pp. {article.pageRange}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemove(article._id)} disabled={isLoading}>
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

import { Input } from "@/components/ui/input";

