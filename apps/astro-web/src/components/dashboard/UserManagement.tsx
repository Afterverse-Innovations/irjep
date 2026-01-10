"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, UserPen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { withConvexOnly } from "@/components/ConvexClientProvider";

function UserManagementInner() {
    const users = useQuery(api.users.list);
    const setRole = useMutation(api.users.setRole);
    const me = useQuery(api.users.viewer);

    const handleRoleUpdate = async (userId: any, role: string) => {
        try {
            await setRole({ userId, role });
            toast.success(`User role updated to ${role}.`);
        } catch (error) {
            toast.error("Failed to update user role.");
        }
    };

    if (users === undefined || me === undefined) {
        return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-200 h-10 w-10" /></div>;
    }

    if (me?.role !== "admin") {
        return (
            <div className="p-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-rose-300" />
                <h2 className="text-2xl font-serif font-bold text-stone-900">Access Denied</h2>
                <p className="text-stone-500">Administrator privileges are required to manage users.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">User Management</h1>
                <p className="text-stone-500 font-medium tracking-wide">Assign roles and permissions to journal members.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden p-2">
                <Table>
                    <TableHeader className="bg-stone-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Member</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Email Address</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Current Role</TableHead>
                            <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-stone-400 py-4 px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u: any) => (
                            <TableRow key={u._id} className="hover:bg-stone-50/50 border-stone-50 transition-all duration-300 group">
                                <TableCell className="py-6 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 font-bold text-xs border border-stone-100">
                                            {u.name?.charAt(0) || "U"}
                                        </div>
                                        <span className="font-serif font-bold text-stone-900">{u.name || "Anonymous Member"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-6">
                                    <span className="text-sm text-stone-500 font-medium">{u.email}</span>
                                </TableCell>
                                <TableCell className="py-6 px-6">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        u.role === 'editor' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-stone-50 text-stone-600 border-stone-100'
                                        }`}>
                                        {u.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-6 px-6">
                                    <div className="flex justify-end gap-2">
                                        {u._id !== me?._id && u.role !== "admin" && (
                                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-700 transition-all" onClick={() => handleRoleUpdate(u._id, "admin")}>
                                                <Shield size={10} className="mr-1.5" /> Make Admin
                                            </Button>
                                        )}
                                        {u._id !== me?._id && u.role !== "editor" && u.role !== "admin" && (
                                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all" onClick={() => handleRoleUpdate(u._id, "editor")}>
                                                <UserPen size={10} className="mr-1.5" /> Make Editor
                                            </Button>
                                        )}
                                        {u._id !== me?._id && u.role !== "author" && (
                                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-stone-100 hover:text-stone-900 transition-all" onClick={() => handleRoleUpdate(u._id, "author")}>
                                                Author
                                            </Button>
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

export const UserManagement = withConvexOnly(UserManagementInner);
