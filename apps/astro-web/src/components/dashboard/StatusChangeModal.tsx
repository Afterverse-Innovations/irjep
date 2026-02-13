"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getStatusLabel } from "./StatusBadge";
import { Loader2, Upload, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface StatusChangeModalProps {
    submissionId: string;
    currentStatus: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StatusChangeModal({
    submissionId,
    currentStatus,
    open,
    onOpenChange,
}: StatusChangeModalProps) {
    const [selectedStatus, setSelectedStatus] = useState("");
    const [note, setNote] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachmentStorageId, setAttachmentStorageId] = useState<string | null>(
        null
    );
    const [attachmentFileName, setAttachmentFileName] = useState<string | null>(
        null
    );

    const availableTransitions = useQuery(
        api.manuscriptLifecycle.getAvailableTransitions,
        { submissionId: submissionId as any }
    );
    const changeStatus = useMutation(api.manuscriptLifecycle.changeStatus);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const resetForm = useCallback(() => {
        setSelectedStatus("");
        setNote("");
        setAttachmentStorageId(null);
        setAttachmentFileName(null);
        setIsUploading(false);
        setIsSubmitting(false);
    }, []);

    const handleClose = useCallback(
        (open: boolean) => {
            if (!open) resetForm();
            onOpenChange(open);
        },
        [onOpenChange, resetForm]
    );

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                setIsUploading(true);
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) throw new Error("Upload failed");

                const { storageId } = (await result.json()) as { storageId: string };
                setAttachmentStorageId(storageId);
                setAttachmentFileName(file.name);
                toast.success("File uploaded successfully.");
            } catch (error) {
                toast.error("Failed to upload file. Please try again.");
                console.error("Upload error:", error);
            } finally {
                setIsUploading(false);
            }
        },
        [generateUploadUrl]
    );

    const handleRemoveFile = useCallback(() => {
        setAttachmentStorageId(null);
        setAttachmentFileName(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedStatus) {
            toast.error("Please select a new status.");
            return;
        }

        if (!note.trim()) {
            toast.error("A note is required for every status change.");
            return;
        }

        try {
            setIsSubmitting(true);
            await changeStatus({
                submissionId: submissionId as any,
                newStatus: selectedStatus,
                note: note.trim(),
                attachmentStorageId: attachmentStorageId ?? undefined,
            });

            toast.success(
                `Status updated to "${getStatusLabel(selectedStatus)}" successfully.`
            );
            handleClose(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status.");
            console.error("Status change error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        selectedStatus,
        note,
        attachmentStorageId,
        submissionId,
        changeStatus,
        handleClose,
    ]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">
                        Change Status
                    </DialogTitle>
                    <DialogDescription className="text-stone-500">
                        Current status:{" "}
                        <span className="font-bold text-stone-700">
                            {getStatusLabel(currentStatus)}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Status Dropdown */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="status-select"
                            className="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                        >
                            New Status *
                        </Label>
                        {availableTransitions === undefined ? (
                            <div className="flex items-center gap-2 text-stone-400 text-sm">
                                <Loader2 size={14} className="animate-spin" />
                                Loading transitions…
                            </div>
                        ) : availableTransitions.length === 0 ? (
                            <p className="text-sm text-stone-500 italic">
                                No status transitions available for your role.
                            </p>
                        ) : (
                            <Select
                                value={selectedStatus}
                                onValueChange={setSelectedStatus}
                            >
                                <SelectTrigger id="status-select">
                                    <SelectValue placeholder="Select new status…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTransitions.map((status: string) => (
                                        <SelectItem key={status} value={status}>
                                            {getStatusLabel(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="status-note"
                            className="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                        >
                            Note *
                        </Label>
                        <Textarea
                            id="status-note"
                            placeholder="Provide a reason or comment for this status change…"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[80px] max-h-[200px] overflow-y-auto resize-y rounded-lg border-stone-200 focus:border-stone-400 text-sm"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Attachment (optional)
                        </Label>
                        {attachmentFileName ? (
                            <div className="flex items-center gap-2 bg-stone-50 rounded-lg border border-stone-200 px-3 py-2">
                                <Paperclip size={14} className="text-stone-400 shrink-0" />
                                <span className="text-sm text-stone-700 truncate flex-1">
                                    {attachmentFileName}
                                </span>
                                <button
                                    onClick={handleRemoveFile}
                                    className="text-stone-400 hover:text-rose-500 transition-colors shrink-0"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 rounded-lg border border-dashed border-stone-300 px-4 py-3 hover:bg-stone-100 hover:border-stone-400 transition-all">
                                {isUploading ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin text-stone-400"
                                    />
                                ) : (
                                    <Upload size={16} className="text-stone-400" />
                                )}
                                <span className="text-sm text-stone-500">
                                    {isUploading ? "Uploading…" : "Click to upload a file"}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={isSubmitting}
                        className="rounded-lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            !selectedStatus ||
                            !note.trim() ||
                            availableTransitions?.length === 0
                        }
                        className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Updating…
                            </>
                        ) : (
                            "Update Status"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
