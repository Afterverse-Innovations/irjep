"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IssuesPage() {
    const issues = useQuery(api.issues.getPublishedIssues);

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-serif font-bold mb-8">Journal Archive</h1>

            {issues === undefined ? (
                <div className="text-stone-500">Loading archives...</div>
            ) : issues.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-stone-50">
                    <h3 className="text-lg font-medium text-stone-900">No Issues Published Yet</h3>
                    <p className="text-stone-500 mt-2">Check back soon for Volume 1, Issue 1.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {issues.map((issue: any) => (
                        <div key={issue._id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-stone-900">{issue.title}</h2>
                                    <p className="text-stone-500 mt-1 uppercase tracking-wider text-xs font-semibold">Volume {issue.volume}, Issue {issue.issueNumber} • {issue.publicationDate}</p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href={`/issues/${issue._id}`}>View Table of Contents</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
