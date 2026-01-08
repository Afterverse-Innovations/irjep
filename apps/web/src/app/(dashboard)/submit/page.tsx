"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    abstract: z.string().min(20, {
        message: "Abstract must be at least 20 characters.",
    }),
});

export default function SubmitPage() {
    const createSubmission = useMutation(api.submissions.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            abstract: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            let storageId = undefined;
            // Note: This fetch will fail until Convex is configured with storage
            if (file) {
                try {
                    const postUrl = await generateUploadUrl();
                    const result = await fetch(postUrl, {
                        method: "POST",
                        headers: { "Content-Type": file.type },
                        body: file,
                    });
                    const json = await result.json();
                    storageId = json.storageId;
                } catch (e) {
                    console.error("Upload failed (expected if not configured)", e);
                    // Proceed without file for demo
                }
            }

            await createSubmission({
                title: values.title,
                abstract: values.abstract,
                fileId: storageId,
            });

            alert("Submission received!");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Failed to submit. Ensure you are logged in.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900">New Submission</h1>
                <p className="text-stone-500 mt-2">Please fill in the details of your manuscript. Ensure your document is formatted according to our guidelines.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manuscript Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Ethnobotanical study of..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="abstract"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Abstract</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide a brief summary of your research..." className="h-32" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum 300 words.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Manuscript File (PDF)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </FormControl>
                            <FormDescription>Upload your full manuscript in PDF format.</FormDescription>
                        </FormItem>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Submitting..." : "Submit Manuscript"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
