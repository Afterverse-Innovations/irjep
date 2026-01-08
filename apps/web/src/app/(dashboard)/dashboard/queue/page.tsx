"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ReviewQueuePage() {
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

    if (!pending) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (user?.role === "author") return <div className="p-4 text-red-500">Access Denied</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900">Submission Queue</h1>
                <p className="text-stone-500">Review and manage incoming papers.</p>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paper Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pending.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-stone-400">
                                    No pending submissions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pending.map((sub: any) => (
                                <TableRow key={sub._id}>
                                    <TableCell className="font-medium max-w-md truncate">
                                        {sub.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-normal">
                                            <Clock size={12} /> {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-stone-500 text-xs">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                onClick={() => handleUpdate(sub._id, "accepted")}
                                            >
                                                <CheckCircle size={14} className="mr-1" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => handleUpdate(sub._id, "rejected")}
                                            >
                                                <XCircle size={14} className="mr-1" /> Reject
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
