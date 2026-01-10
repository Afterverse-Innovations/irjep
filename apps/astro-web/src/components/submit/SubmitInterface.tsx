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
import { api } from "@local-convex/_generated/api";
import { useState } from "react";
import { Loader2, LogIn, Upload, FileCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { SignInButton } from "@clerk/astro/react";
import { useUser } from "@clerk/clerk-react";
import { withConvex } from "@/components/ConvexClientProvider";

const formSchema = z.object({
    title: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    abstract: z.string().min(20, {
        message: "Abstract must be at least 20 characters.",
    }),
});

function SubmitInterfaceInner() {
    const { isLoaded, isSignedIn } = useUser();
    const createSubmission = useMutation(api.submissions.create);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
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
        if (!file) {
            toast.error("Please upload your research paper (PDF).");
            return;
        }

        try {
            setIsSubmitting(true);

            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const json = await result.json();
            const storageId = json.storageId;

            await createSubmission({
                title: values.title,
                abstract: values.abstract,
                fileId: storageId,
            });

            toast.success("Paper submitted successfully!");
            window.location.href = "/dashboard";
        } catch (error) {
            toast.error("Failed to submit paper. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isLoaded) return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-stone-300 h-10 w-10" /></div>;

    if (!isSignedIn) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <div className="bg-white border border-stone-100 p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-stone-200/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-stone-100/50 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-stone-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-stone-100 shadow-inner">
                            <LogIn className="h-10 w-10 text-stone-900" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6 tracking-tight">Author Portal</h1>
                        <p className="text-stone-500 mb-12 max-w-md mx-auto font-medium leading-relaxed text-lg">
                            To maintain the integrity of our peer-review process, all contributors must be authenticated to submit and track research.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SignInButton mode="modal">
                                <Button size="lg" className="w-full sm:w-auto px-12 h-16 text-base rounded-2xl bg-stone-900 hover:bg-stone-800 shadow-xl shadow-stone-900/20 text-white font-bold uppercase tracking-widest transition-all active:scale-[0.98]">
                                    Get Started
                                </Button>
                            </SignInButton>
                            <a href="/author-guidelines" className="w-full sm:w-auto px-10 h-16 text-xs font-bold uppercase tracking-widest border border-stone-200 rounded-2xl flex items-center justify-center hover:bg-stone-50 transition-all text-stone-600">
                                Review Guidelines
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-serif font-bold text-stone-900 leading-tight">New Submission</h1>
                <p className="text-stone-500 mt-4 max-w-xl mx-auto font-medium">Please provide the details of your research paper. Ensure your document follows the <a href="/author-guidelines" className="text-emerald-600 hover:underline">journal guidelines</a>.</p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                        Paper Title <span className="text-emerald-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Ethnobotanical study of medicinal plants..." className="h-14 text-lg border-stone-200 rounded-2xl focus-visible:ring-emerald-500" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs font-bold text-rose-500" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="abstract"
                            render={({ field }) => (
                                <FormItem className="space-y-4">
                                    <FormLabel className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                        Abstract <span className="text-emerald-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide a brief summary of your research methods and findings..." className="h-48 text-lg border-stone-200 rounded-2xl focus-visible:ring-emerald-500 resize-none py-4" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter flex items-center gap-1.5">
                                        <Info size={12} /> Recommended maximum 300 words.
                                    </FormDescription>
                                    <FormMessage className="text-xs font-bold text-rose-500" />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                Paper File (PDF) <span className="text-emerald-500">*</span>
                            </label>
                            <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 text-center ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-200'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="space-y-2">
                                        <FileCheck className="h-12 w-12 mx-auto text-emerald-500" />
                                        <p className="font-serif font-bold text-emerald-900">{file.name}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">File Ready for Upload</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="h-10 w-10 mx-auto text-stone-300" />
                                        <p className="font-serif font-bold text-stone-900">Drag & Drop or Click to Upload</p>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">PDF Format Only (Max 10MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 shadow-xl shadow-stone-900/10 text-sm font-bold uppercase tracking-[0.2em] transition-all">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Submitting Paper...
                                </>
                            ) : (
                                "Finalize Submission"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export const SubmitInterface = withConvex(SubmitInterfaceInner);
