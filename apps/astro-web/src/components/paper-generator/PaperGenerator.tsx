import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, ChevronRight, FileCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { mapSubmissionToPaperData } from "@/lib/submission-mapper";
import { PaperPreview } from "@/components/paper-renderer/PaperPreview";

type Step = "select-submission" | "select-template" | "preview" | "done";

function PaperGeneratorInner() {
    const [step, setStep] = useState<Step>("select-submission");
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [paperData, setPaperData] = useState<StructuredPaperData | null>(null);
    const [saving, setSaving] = useState(false);

    // Queries
    const submissions = useQuery(api.submissions.getAcceptedSubmissions);
    const templates = useQuery(api.templates.listActive);
    const selectedSubmission = useQuery(
        api.submissions.getById,
        selectedSubmissionId ? { id: selectedSubmissionId as any } : "skip"
    );
    const selectedTemplate = useQuery(
        api.templates.getById,
        selectedTemplateId ? { id: selectedTemplateId as any } : "skip"
    );

    // Check for existing papers for this submission
    const existingPapers = useQuery(
        api.papers.listBySubmission,
        selectedSubmissionId ? { submissionId: selectedSubmissionId as any } : "skip"
    );

    const generatePaper = useMutation(api.papers.generate);

    // Build paper data from submission when both are selected
    const templateConfig = selectedTemplate?.config as JournalTemplateConfig | undefined;

    const handleProceedToTemplate = () => {
        if (!selectedSubmissionId) {
            toast.error("Please select a submission");
            return;
        }
        setStep("select-template");
    };

    const handleProceedToPreview = () => {
        if (!selectedTemplateId) {
            toast.error("Please select a template");
            return;
        }
        if (!selectedSubmission) return;

        // If existing papers exist, don't pre-fill from submission
        if (existingPapers && existingPapers.length > 0) {
            // Use existing paper data
            setPaperData(existingPapers[0].renderedData as StructuredPaperData);
        } else {
            // Pre-fill from submission
            setPaperData(mapSubmissionToPaperData(selectedSubmission));
        }
        setStep("preview");
    };

    const handleSave = async () => {
        if (!paperData || !selectedSubmissionId || !selectedTemplateId) return;
        setSaving(true);
        try {
            const id = await generatePaper({
                submissionId: selectedSubmissionId as any,
                templateId: selectedTemplateId as any,
                renderedData: paperData,
            });
            toast.success("Paper saved successfully!");
            setStep("done");
            // Redirect to paper view
            setTimeout(() => {
                window.location.href = `/dashboard/papers/${id}`;
            }, 1000);
        } catch (e: any) {
            toast.error(e.message || "Failed to save paper");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            {/* Steps Indicator */}
            <div className="flex items-center gap-2 mb-8">
                {[
                    { id: "select-submission", label: "Select Submission" },
                    { id: "select-template", label: "Select Template" },
                    { id: "preview", label: "Preview & Save" },
                ].map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight size={14} className="text-stone-300" />}
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${step === s.id
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : step === "done" || (i === 0 && step !== "select-submission") || (i === 1 && (step === "preview" || step === "done"))
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-stone-50 text-stone-400"
                                }`}
                        >
                            <span>{i + 1}.</span> {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Step 1: Select Submission */}
            {step === "select-submission" && (
                <div className="bg-white rounded-2xl border border-stone-100 p-8 max-w-2xl">
                    <h2 className="text-lg font-bold text-stone-900 mb-1">Select Submission</h2>
                    <p className="text-sm text-stone-500 mb-6">Choose an accepted submission to generate a paper from</p>

                    {submissions === undefined ? (
                        <div className="flex items-center text-stone-400 py-10 justify-center">
                            <Loader2 className="animate-spin mr-2" size={16} /> Loading...
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-10 text-stone-400">
                            <p className="text-sm">No accepted submissions available</p>
                        </div>
                    ) : (
                        <div className="space-y-2 mb-6">
                            {submissions.map((sub) => (
                                <label
                                    key={sub._id}
                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedSubmissionId === sub._id
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="submission"
                                        value={sub._id}
                                        checked={selectedSubmissionId === sub._id}
                                        onChange={() => setSelectedSubmissionId(sub._id)}
                                        className="mt-1 text-emerald-600 focus:ring-emerald-300"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-stone-900 truncate">{sub.title}</div>
                                        <div className="text-xs text-stone-500 mt-0.5">
                                            {sub.articleType} · Submitted {new Date(sub.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleProceedToTemplate}
                        disabled={!selectedSubmissionId}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Continue <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Step 2: Select Template */}
            {step === "select-template" && (
                <div className="bg-white rounded-2xl border border-stone-100 p-8 max-w-2xl">
                    <h2 className="text-lg font-bold text-stone-900 mb-1">Select Template</h2>
                    <p className="text-sm text-stone-500 mb-6">Choose a journal template to apply</p>

                    {templates === undefined ? (
                        <div className="flex items-center text-stone-400 py-10 justify-center">
                            <Loader2 className="animate-spin mr-2" size={16} /> Loading...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-stone-400 mb-3">No templates available</p>
                            <a href="/dashboard/templates/new" className="text-sm text-emerald-600 hover:underline">
                                Create a template first →
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-2 mb-6">
                            {templates.map((tpl) => (
                                <label
                                    key={tpl._id}
                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedTemplateId === tpl._id
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="template"
                                        value={tpl._id}
                                        checked={selectedTemplateId === tpl._id}
                                        onChange={() => setSelectedTemplateId(tpl._id)}
                                        className="mt-1 text-emerald-600 focus:ring-emerald-300"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-stone-900 truncate">{tpl.name}</div>
                                        <div className="text-xs text-stone-500 mt-0.5">
                                            v{tpl.version} · {tpl.description || "No description"}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setStep("select-submission")}
                            className="px-4 py-2.5 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleProceedToPreview}
                            disabled={!selectedTemplateId}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Generate Preview <Eye size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Save */}
            {step === "preview" && paperData && templateConfig && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-stone-900">Paper Preview</h2>
                            <p className="text-xs text-stone-500">
                                {selectedSubmission?.title} · Template: {selectedTemplate?.name}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setStep("select-template")}
                                className="px-4 py-2 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                            >
                                {saving ? (
                                    <><Loader2 className="animate-spin" size={14} /> Saving...</>
                                ) : (
                                    <><FileCheck size={14} /> Save Paper</>
                                )}
                            </button>
                        </div>
                    </div>

                    {existingPapers && existingPapers.length > 0 && (
                        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                            ⚠️ This submission already has {existingPapers.length} generated paper(s). Paper data was loaded from the most recent version.
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden" style={{ height: "70vh" }}>
                        <PaperPreview config={templateConfig} data={paperData} />
                    </div>
                </div>
            )}

            {/* Done */}
            {step === "done" && (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                    <div className="text-emerald-500 mb-4">
                        <FileCheck className="mx-auto" size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Paper Saved!</h3>
                    <p className="text-sm text-stone-500">Redirecting to paper view...</p>
                </div>
            )}
        </div>
    );
}

const PaperGenerator = withConvex(PaperGeneratorInner);
export default PaperGenerator;
