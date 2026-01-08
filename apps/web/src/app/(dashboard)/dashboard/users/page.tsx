"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function UserManagementPage() {
    const users = useQuery(api.users.list);
    const setRole = useMutation(api.users.setRole);
    const me = useQuery(api.users.viewer);

    if (!users) return <div className="p-4"><Loader2 className="animate-spin" /></div>;
    if (me?.role !== "admin") return <div className="p-4 text-red-500">Unauthorized</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold">User Management</h1>
            <div className="bg-white rounded-md border text-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u: any) => (
                            <TableRow key={u._id}>
                                <TableCell>{u.name || "No Name"}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell className="capitalize font-medium">{u.role}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {u.role !== "admin" && (
                                            <Button variant="outline" size="sm" onClick={() => setRole({ userId: u._id, role: "admin" })}>Make Admin</Button>
                                        )}
                                        {u.role !== "editor" && (
                                            <Button variant="outline" size="sm" onClick={() => setRole({ userId: u._id, role: "editor" })}>Make Editor</Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
