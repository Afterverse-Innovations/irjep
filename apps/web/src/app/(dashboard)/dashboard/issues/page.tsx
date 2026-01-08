"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar } from "lucide-react";

export default function ManageIssuesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Manage Issues</h1>
                    <p className="text-stone-500">Create and publish journal volumes and issues.</p>
                </div>
                <Button>
                    <Plus size={18} className="mr-2" /> New Issue
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-12 text-center text-stone-400">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-10" />
                <h3 className="text-lg font-medium text-stone-900">Issue Management Coming Soon</h3>
                <p className="max-w-xs mx-auto mt-2">The editor tools for managing publication cycles and assigning papers to issues are under development.</p>
            </div>
        </div>
    );
}
