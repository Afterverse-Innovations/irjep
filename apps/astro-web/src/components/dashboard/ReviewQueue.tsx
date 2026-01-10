"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";

function ReviewQueueInner() {
    const pending = useQuery(api.submissions.getPendingSubmissions);
    const updateStatus = useMutation(api.submissions.updateStatus);
    const user = useQuery(api.users.viewer);

    const handleUpdate = async (submissionId: any, status: string) => {
        try {
            await updateStatus({ submissionId, status });
            toast.success(`Paper successfully ${status}.`);
        } catch (error) {
            toast.error("An error occurred while updating paper status.");
        }
    };

    if (user === undefined || pending === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-200 h-10 w-10" /></div>;
    }

    if (user?.role === "author") {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">Access Denied</h2>
                <p className="text-stone-500">Only editors and admins can access the review queue.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">Review Queue</h1>
                <p className="text-stone-500 font-medium tracking-wide">Evaluate and manage incoming research papers.</p>
            </div>

            <div className="bg-white rounded-lg border border-stone-100 shadow-sm overflow-hidden p-2">
                <Table>
                    <TableHeader className="bg-stone-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="w-[450px] font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Paper Title</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Status</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Submitted</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pending.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-stone-300 space-y-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="font-serif italic text-lg text-stone-400">Queue is empty. All caught up!</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pending.map((sub: any) => (
                                <TableRow key={sub._id} className="hover:bg-stone-50/50 border-stone-50 transition-all duration-300 group">
                                    <TableCell className="font-medium align-top py-6 px-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-stone-900 font-serif font-bold text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">{sub.title}</span>
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Initial Submission</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top py-6 px-6">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 gap-1.5 font-bold text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-md shadow-none">
                                            <Clock size={10} /> {sub.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-stone-500 font-medium align-top py-6 px-6">
                                        <div className="text-[11px] uppercase tracking-wider">
                                            {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-top py-6 px-6">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                onClick={() => handleUpdate(sub._id, "accepted")}
                                            >
                                                <CheckCircle size={12} className="mr-1.5" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-rose-700 hover:bg-rose-600 hover:text-white border-rose-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                                                onClick={() => handleUpdate(sub._id, "rejected")}
                                            >
                                                <XCircle size={12} className="mr-1.5" /> Reject
                                            </Button>
                                        </div>
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
