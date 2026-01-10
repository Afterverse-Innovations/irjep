"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

type ModalType = "info" | "success" | "warning" | "error";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    type?: ModalType;
    actionLabel?: string;
    onAction?: () => void;
}

const icons = {
    info: <Info className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    error: <AlertCircle className="h-6 w-6 text-red-500" />,
};

export function AlertModal({
    isOpen,
    onClose,
    title,
    description,
    type = "info",
    actionLabel = "Close",
    onAction,
}: AlertModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-row items-center gap-4">
                    <div className="flex-shrink-0">
                        {icons[type]}
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
                        <DialogDescription className="mt-2 text-stone-600">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button
                        variant={type === "error" ? "destructive" : "default"}
                        onClick={() => {
                            if (onAction) onAction();
                            onClose();
                        }}
                    >
                        {actionLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
