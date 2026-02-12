"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Loader2,
    User,
    Users,
    FileText,
    Upload,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    Download,
    Info,
    X,
    FileUp
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/astro/react";
import { withConvex } from "@/components/ConvexClientProvider";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useDropzone } from "react-dropzone";

// Formatter for phone number: (XXX) XXX-XXXX
const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const formSchema = z.object({
    // Step 1: Author Info
    correspondingAuthor: z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(14, "Valid phone number (XXX) XXX-XXXX is required"),
        address: z.string().min(10, "Full address is required"),
    }),
    researchAuthors: z.array(z.object({
        name: z.string().min(2, "Name is required"),
        affiliation: z.string().min(2, "Affiliation is required"),
    })).min(1, "At least one research author is required"),

    // Step 2: Article Details
    articleType: z.string().min(2, "Article type is required"),
    title: z.string().min(5, "Title must be at least 5 characters"),
    abstract: z.string().min(20, "Abstract must be at least 20 characters").refine(
        (val) => val.split(/\s+/).filter(Boolean).length <= 300,
        "Abstract must not exceed 300 words"
    ),
    keywords: z.array(z.string()).min(4, "Minimum 4 keywords required").max(6, "Maximum 6 keywords allowed"),
});

function SubmissionWizardInner() {
    const { isLoaded } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");

    // File states
    const [copyrightFile, setCopyrightFile] = useState<File | null>(null);
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const createSubmission = useMutation(api.submissions.create);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            correspondingAuthor: { name: "", email: "", phone: "", address: "" },
            researchAuthors: [{ name: "", affiliation: "" }],
            articleType: "",
            title: "",
            abstract: "",
            keywords: [],
        },
    });

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "researchAuthors",
    });

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) {
            fieldsToValidate = ['correspondingAuthor', 'researchAuthors'];
        } else if (step === 2) {
            fieldsToValidate = ['articleType', 'title', 'abstract', 'keywords'];
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) setStep(step + 1);
    }

    const prevStep = () => setStep(step - 1);

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        move(result.source.index, result.destination.index);
    };

    const handleAddKeyword = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = keywordInput.trim().replace(/,$/, '');
            if (val && !form.getValues('keywords').includes(val)) {
                if (form.getValues('keywords').length < 6) {
                    form.setValue('keywords', [...form.getValues('keywords'), val]);
                    setKeywordInput("");
                } else {
                    toast.error("Maximum 6 keywords allowed");
                }
            }
        }
    };

    const removeKeyword = (kw: string) => {
        form.setValue('keywords', form.getValues('keywords').filter(k => k !== kw));
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (step !== 3) return;

        if (!copyrightFile || !manuscriptFile) {
            toast.error("Please upload both Copyright Form and Manuscript.");
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Upload Copyright Form
            const copyrightUrl = await generateUploadUrl();
            const copyrightRes = await fetch(copyrightUrl, {
                method: "POST",
                headers: { "Content-Type": copyrightFile.type },
                body: copyrightFile,
            });
            const { storageId: copyrightId } = (await copyrightRes.json()) as { storageId: string };

            // 2. Upload Manuscript
            const manuscriptUrl = await generateUploadUrl();
            const manuscriptRes = await fetch(manuscriptUrl, {
                method: "POST",
                headers: { "Content-Type": manuscriptFile.type },
                body: manuscriptFile,
            });
            const { storageId: manuscriptId } = (await manuscriptRes.json()) as { storageId: string };

            // 3. Create Submission
            await createSubmission({
                ...values,
                copyrightFileId: copyrightId,
                manuscriptFileId: manuscriptId,
            });

            toast.success("Submission successful!");
            setStep(4); // Success step
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-stone-300" /></div>;

    if (step === 4) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="bg-white border border-stone-100 p-12 rounded-3xl shadow-2xl shadow-stone-200/50">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Submission Successful</h2>
                    <p className="text-stone-500 mb-10 max-w-md mx-auto">
                        Your research paper has been safely reached our editorial office. You can track its progress in your dashboard.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.location.href = "/dashboard"} className="h-12 px-8 rounded-xl bg-stone-900 text-white font-semibold">
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = "/"} className="h-12 px-8 rounded-xl border-stone-200 text-stone-600 font-semibold">
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900">Research Submission</h1>
                        <p className="text-stone-500 text-sm mt-1">Step {step} of 3: {step === 1 ? "Author Details" : step === 2 ? "Article Metadata" : "Final Uploads"}</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500' : 'bg-stone-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* STEP 1: AUTHOR INFO */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-xl shadow-stone-200/40">
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-50">
                                    <div className="p-2 bg-stone-50 rounded-lg"><User className="h-5 w-5 text-stone-600" /></div>
                                    <h3 className="text-lg font-bold text-stone-900">Corresponding Author</h3>
                                    <div className="group relative ml-1">
                                        <Info className="h-4 w-4 text-stone-300 cursor-help hover:text-stone-500 transition-colors" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl font-medium leading-relaxed">
                                            The author leading the submission and serving as the primary contact point for the journal throughout the review process.
                                        </div>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="correspondingAuthor.name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Name</FormLabel>
                                                <FormControl><Input placeholder="Dr. Jane Doe" className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="correspondingAuthor.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email Address</FormLabel>
                                                <FormControl><Input placeholder="jane@university.edu" className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="correspondingAuthor.phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="(555) 000-0000"
                                                        className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm focus-visible:ring-stone-200"
                                                        {...field}
                                                        onChange={(e) => {
                                                            const formatted = formatPhoneNumber(e.target.value);
                                                            field.onChange(formatted);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="correspondingAuthor.address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Complete Mailing Address</FormLabel>
                                                <FormControl><Input placeholder="Department of Botany, University..." className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-xl shadow-stone-200/40">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-stone-50 rounded-lg"><Users className="h-5 w-5 text-stone-600" /></div>
                                        <h3 className="text-lg font-bold text-stone-900">Research Authors</h3>
                                        <div className="group relative ml-1">
                                            <Info className="h-4 w-4 text-stone-300 cursor-help hover:text-stone-500 transition-colors" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl font-medium leading-relaxed">
                                                All contributors who should be credited. You can drag and drop handles to reorder authors.
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", affiliation: "" })} className="h-9 px-4 rounded-lg border-stone-100 text-stone-600 hover:bg-stone-50 font-semibold">
                                        <Plus className="h-4 w-4 mr-2" /> Add Author
                                    </Button>
                                </div>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="authors">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                {fields.map((field, index) => (
                                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="group p-6 rounded-2xl border border-stone-50 bg-stone-50/20 hover:border-stone-100 transition-all"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-stone-300 hover:text-stone-600">
                                                                        <GripVertical className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`researchAuthors.${index}.name`}
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Author Name</FormLabel>
                                                                                    <FormControl><Input placeholder="Name" className="h-10 rounded-lg border-stone-50 bg-white text-sm focus-visible:ring-stone-100" {...field} /></FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`researchAuthors.${index}.affiliation`}
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Designation / Affiliation</FormLabel>
                                                                                    <FormControl><Input placeholder="University of..." className="h-10 rounded-lg border-stone-50 bg-white text-sm focus-visible:ring-stone-100" {...field} /></FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="text-stone-400 hover:text-rose-500 hover:bg-rose-50"><Trash2 className="h-5 w-5" /></Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ARTICLE DETAILS */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-xl shadow-stone-200/40">
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-50">
                                    <div className="p-2 bg-stone-50 rounded-lg"><FileText className="h-5 w-5 text-stone-600" /></div>
                                    <h3 className="text-lg font-bold text-stone-900">Article Identification</h3>
                                </div>
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="articleType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Article Type</FormLabel>
                                                    <div className="group relative">
                                                        <Info className="h-3 w-3 text-stone-300 cursor-help hover:text-stone-500" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                            e.g., Original Research, Review Article, Case Study, or Short Communication.
                                                        </div>
                                                    </div>
                                                </div>
                                                <FormControl><Input placeholder="e.g. Original Research" className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Title of Study</FormLabel>
                                                <FormControl><Input placeholder="Enter title of your paper" className="h-12 rounded-xl border-stone-100 bg-stone-50/30 text-sm font-medium focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="abstract"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Abstract (Max 300 words)</FormLabel>
                                                <FormControl><Textarea placeholder="Summary of methods and results..." className="h-48 rounded-2xl border-stone-100 bg-stone-50/30 text-sm leading-relaxed py-4 px-4 resize-none focus-visible:ring-stone-200" {...field} /></FormControl>
                                                <div className="flex justify-between items-center mt-2 px-1">
                                                    <FormDescription className="text-[12px] text-stone-400 font-medium">Briefly summarize objective, methodology, results and conclusion.</FormDescription>
                                                    <span className={`text-[12px] font-bold ${field.value.split(/\s+/).filter(Boolean).length > 300 ? 'text-rose-500' : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'}`}>
                                                        {field.value.split(/\s+/).filter(Boolean).length} / 300 words
                                                    </span>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="keywords"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Keywords (4-6 required)</FormLabel>
                                                    <div className="group relative">
                                                        <Info className="h-3 w-3 text-stone-300 cursor-help hover:text-stone-500" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                            Press Enter or comma to add. These improve paper discoverability.
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3 min-h-[3.5rem] rounded-xl border border-stone-100 bg-stone-50/30 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-stone-200 transition-all">
                                                    {field.value.map((kw, i) => (
                                                        <Badge key={i} className="bg-stone-900 text-white h-7 gap-1 px-3 border-0 rounded-lg text-xs font-bold tracking-wide">
                                                            {kw}
                                                            <button type="button" onClick={() => removeKeyword(kw)} className="ml-1 hover:text-rose-400 transition-colors"><X className="h-3 w-3" /></button>
                                                        </Badge>
                                                    ))}
                                                    <input
                                                        className="flex-1 bg-transparent border-none outline-none text-sm min-w-[10rem] placeholder:text-stone-400"
                                                        placeholder={field.value.length < 6 ? "Type and press enter..." : ""}
                                                        value={keywordInput}
                                                        onChange={(e) => setKeywordInput(e.target.value)}
                                                        onKeyDown={handleAddKeyword}
                                                        disabled={field.value.length >= 6}
                                                    />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: FILE UPLOADS */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-8">
                                <FileDropZone
                                    title="Copyright Form"
                                    description="Download template, sign, scan and upload."
                                    file={copyrightFile}
                                    onFileChange={setCopyrightFile}
                                    accept={{ 'application/pdf': ['.pdf'] }}
                                    downloadLink="/downloads/copyright_form.pdf"
                                    icon={<Upload className="h-5 w-5 text-emerald-600" />}
                                    accentColor="emerald"
                                />

                                <FileDropZone
                                    title="Manuscript"
                                    description="Main research document in editable format."
                                    file={manuscriptFile}
                                    onFileChange={setManuscriptFile}
                                    accept={{ 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
                                    downloadLink="/downloads/manuscript_template.docx"
                                    icon={<FileUp className="h-5 w-5 text-indigo-600" />}
                                    accentColor="indigo"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-stone-100">
                        {step > 1 ? (
                            <Button type="button" variant="ghost" onClick={prevStep} className="h-12 px-6 rounded-xl hover:bg-stone-50 text-stone-600 font-bold tracking-wider text-sm">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Previous Step
                            </Button>
                        ) : <div />}

                        {step < 3 ? (
                            <Button key="next-button" type="button" onClick={nextStep} className="h-12 px-8 rounded-lg bg-stone-900 text-white font-bold tracking-widest text-sm group transition-all">
                                Next Phase <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button key="submit-button" type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-[0.2em] uppercase text-sm shadow-md shadow-emerald-100">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...
                                    </>
                                ) : (
                                    "Complete Submission"
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}

// Helper Component for File Uploads
function FileDropZone({ title, description, file, onFileChange, accept, downloadLink, icon, accentColor }: any) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => onFileChange(acceptedFiles[0]),
        accept,
        multiple: false
    });

    const isEmerald = accentColor === 'emerald';

    return (
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 space-y-6">
            <div className="flex items-center gap-3">
                <div className={`p-2 ${isEmerald ? 'bg-emerald-50' : 'bg-indigo-50'} rounded-xl`}>{icon}</div>
                <h3 className="text-lg font-bold text-stone-900">{title}</h3>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
            <a href={downloadLink} className={`inline-flex items-center text-xs font-bold ${isEmerald ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-700 bg-indigo-50'} h-10 px-4 rounded-xl transition-all hover:bg-opacity-80`}>
                <Download className="h-4 w-4 mr-2" /> Download Template
            </a>

            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center cursor-pointer
                    ${file ? (isEmerald ? 'border-emerald-200 bg-emerald-50/20' : 'border-indigo-200 bg-indigo-50/20') :
                        (isDragActive ? (isEmerald ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-200 bg-indigo-50') : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50')}
                `}
            >
                <input {...getInputProps()} />
                {file ? (
                    <div className="space-y-3">
                        <CheckCircle2 className={`h-10 w-10 mx-auto ${isEmerald ? 'text-emerald-500' : 'text-indigo-500'}`} />
                        <p className="text-sm font-bold text-stone-900 truncate px-2">{file.name}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Selected</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <FileUp className="h-8 w-8 mx-auto text-stone-300" />
                        <p className="text-sm font-semibold text-stone-900">{isDragActive ? "Drop here" : `Upload ${title}`}</p>
                        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">
                            {isEmerald ? "PDF Only" : ".DOC or .DOCX"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export const SubmissionWizard = withConvex(SubmissionWizardInner);
