"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface CorrectionModalProps {
    submissionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CorrectionModal({
    submissionId,
    open,
    onOpenChange,
}: CorrectionModalProps) {
    const [note, setNote] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachmentStorageId, setAttachmentStorageId] = useState<string | null>(null);
    const [attachmentFileName, setAttachmentFileName] = useState<string | null>(null);

    const changeStatus = useMutation(api.manuscriptLifecycle.changeStatus);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const resetForm = useCallback(() => {
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
        if (!note.trim()) {
            toast.error("Please provide a note describing your corrections.");
            return;
        }

        try {
            setIsSubmitting(true);
            await changeStatus({
                submissionId: submissionId as any,
                newStatus: "correction_submitted",
                note: note.trim(),
                attachmentStorageId: attachmentStorageId ?? undefined,
            });

            toast.success("Correction submitted successfully.");
            handleClose(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit correction.");
            console.error("Correction submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [note, attachmentStorageId, submissionId, changeStatus, handleClose]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">
                        Upload Correction
                    </DialogTitle>
                    <DialogDescription className="text-stone-500">
                        Submit your revised manuscript and describe the changes you've made.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Note */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="correction-note"
                            className="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                        >
                            Describe your corrections *
                        </Label>
                        <Textarea
                            id="correction-note"
                            placeholder="Explain the changes you've made in response to the review feedback…"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="min-h-[80px] max-h-[200px] overflow-y-auto resize-y rounded-lg border-stone-200 focus:border-stone-400 text-sm"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Revised Manuscript
                        </Label>
                        {attachmentFileName ? (
                            <div className="flex items-center gap-2 bg-stone-50 rounded-lg border border-stone-200 px-3 py-2">
                                <Paperclip size={14} className="text-stone-400 shrink-0" />
                                <span className="text-sm text-stone-700 truncate flex-1">
                                    {attachmentFileName.substring(0, 40)}
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
                                    <Loader2 size={16} className="animate-spin text-stone-400" />
                                ) : (
                                    <Upload size={16} className="text-stone-400" />
                                )}
                                <span className="text-sm text-stone-500">
                                    {isUploading ? "Uploading…" : "Click to upload revised manuscript"}
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
                        disabled={isSubmitting || !note.trim()}
                        className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            "Submit Correction"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
