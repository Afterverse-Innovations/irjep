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
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useUser, SignInButton } from "@clerk/nextjs";
import { AlertModal } from "@/components/ui/alert-modal";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    abstract: z.string().min(20, {
        message: "Abstract must be at least 20 characters.",
    }),
});

export default function SubmitPage() {
    const { isLoaded, isSignedIn } = useUser();
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
                    toast.warning("File upload failed. Proceeding with metadata only.");
                }
            }

            await createSubmission({
                title: values.title,
                abstract: values.abstract,
                fileId: storageId,
            });

            toast.success("Paper submitted successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to submit paper. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isLoaded) return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300" /></div>;

    if (!isSignedIn) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
                <div className="bg-stone-50 border border-stone-200 p-10 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="h-8 w-8 text-stone-600" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Sign in to Submit</h1>
                    <p className="text-stone-600 mb-8 max-w-md mx-auto">
                        To maintain the integrity of our peer-review process, all authors must be registered and logged in to submit their research papers.
                    </p>
                    <SignInButton mode="modal">
                        <Button size="lg" className="px-8 h-12 text-base">
                            Log In or Sign Up
                        </Button>
                    </SignInButton>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900">New Submission</h1>
                <p className="text-stone-500 mt-2">Please fill in the details of your research paper. Ensure your document is formatted according to our guidelines.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paper Title</FormLabel>
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
                            <FormLabel>Paper File (PDF)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </FormControl>
                            <FormDescription>Upload your full research paper in PDF format.</FormDescription>
                        </FormItem>

                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Submitting..." : "Submit Paper"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
