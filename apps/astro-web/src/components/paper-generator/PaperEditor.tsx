import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, Edit, Save, ChevronLeft, ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type {
    StructuredPaperData,
    PaperSection,
    PaperReference,
    PaperTable,
    PaperEndMatter,
} from "@/lib/paper-data";
import { PaperPreview } from "@/components/paper-renderer/PaperPreview";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface PaperEditorProps {
    paperId: string;
}

function PaperEditorInner({ paperId }: PaperEditorProps) {
    const paper = useQuery(api.papers.getById, { id: paperId as any });
    const updatePaper = useMutation(api.papers.update);
    const updateStatus = useMutation(api.papers.updateStatus);

    const [mode, setMode] = useState<"preview" | "edit">("preview");
    const [editData, setEditData] = useState<StructuredPaperData | null>(null);
    const [saving, setSaving] = useState(false);
    const [editTab, setEditTab] = useState<"content" | "references" | "metadata">("content");

    if (paper === undefined) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading paper...
            </div>
        );
    }

    if (!paper) {
        return (
            <div className="text-center py-20">
                <p className="text-stone-500">Paper not found</p>
                <a href="/dashboard/papers" className="text-sm text-emerald-600 hover:underline mt-2 inline-block">
                    ← Back to papers
                </a>
            </div>
        );
    }

    const templateConfig = paper.templateConfig as JournalTemplateConfig;
    const rawPaperData = (editData ?? paper.renderedData) as StructuredPaperData;
    // Normalize body for legacy data
    const paperData: StructuredPaperData = {
        ...rawPaperData,
        body: Array.isArray(rawPaperData.body) ? rawPaperData.body : [],
    };

    const handleStartEdit = () => {
        const raw = JSON.parse(JSON.stringify(paper.renderedData));
        // Normalize body: legacy data may have body as a string instead of PaperSection[]
        if (!Array.isArray(raw.body)) {
            raw.body = typeof raw.body === "string" && raw.body
                ? [{ heading: "", content: raw.body }]
                : [];
        }
        setEditData(raw);
        setMode("edit");
    };

    const handleCancelEdit = () => {
        setEditData(null);
        setMode("preview");
    };

    const handleSave = async () => {
        if (!editData) return;
        setSaving(true);
        try {
            await updatePaper({ id: paperId as any, renderedData: editData });
            toast.success("Paper updated");
            setEditData(null);
            setMode("preview");
        } catch (e: any) {
            toast.error(e.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleMarkFinal = async () => {
        if (!confirm("Mark this paper as final? It can still be edited later.")) return;
        try {
            await updateStatus({ id: paperId as any, status: "final" });
            toast.success("Paper marked as final");
        } catch (e: any) {
            toast.error(e.message || "Failed to update status");
        }
    };

    // ─── Section Helpers ──────────────────────────────────────
    const addSection = () => {
        if (!editData) return;
        setEditData({
            ...editData,
            body: [...editData.body, { heading: "New Section", content: "" }],
        });
    };

    const updateSection = (index: number, updates: Partial<PaperSection>) => {
        if (!editData) return;
        const newBody = [...editData.body];
        newBody[index] = { ...newBody[index], ...updates };
        setEditData({ ...editData, body: newBody });
    };

    const removeSection = (index: number) => {
        if (!editData) return;
        setEditData({ ...editData, body: editData.body.filter((_: PaperSection, i: number) => i !== index) });
    };

    const moveSectionUp = (index: number) => {
        if (!editData || index === 0) return;
        const newBody = [...editData.body];
        [newBody[index - 1], newBody[index]] = [newBody[index], newBody[index - 1]];
        setEditData({ ...editData, body: newBody });
    };

    const moveSectionDown = (index: number) => {
        if (!editData || index >= editData.body.length - 1) return;
        const newBody = [...editData.body];
        [newBody[index], newBody[index + 1]] = [newBody[index + 1], newBody[index]];
        setEditData({ ...editData, body: newBody });
    };

    // ─── Reference Helpers ────────────────────────────────────
    const addReference = () => {
        if (!editData) return;
        setEditData({
            ...editData,
            references: [...editData.references, { number: editData.references.length + 1, text: "" }],
        });
    };

    const updateReference = (index: number, text: string) => {
        if (!editData) return;
        const newRefs = [...editData.references];
        newRefs[index] = { ...newRefs[index], text };
        setEditData({ ...editData, references: newRefs });
    };

    const removeReference = (index: number) => {
        if (!editData) return;
        setEditData({ ...editData, references: editData.references.filter((_, i) => i !== index) });
    };

    // ─── End-Matter Helpers ───────────────────────────────────
    const getEndMatter = (): PaperEndMatter => editData?.endMatter ?? {
        contributorParticulars: [],
        correspondingAuthor: { name: "", address: "", email: "" },
        authorDeclaration: { competingInterests: "None", ethicsApproval: "", informedConsent: "" },
        plagiarismChecking: { checkerEntries: [] },
    };

    const updateEndMatter = (updates: Partial<PaperEndMatter>) => {
        if (!editData) return;
        setEditData({ ...editData, endMatter: { ...getEndMatter(), ...updates } });
    };

    const addContributor = () => {
        const em = getEndMatter();
        updateEndMatter({
            contributorParticulars: [
                ...em.contributorParticulars,
                { number: em.contributorParticulars.length + 1, designation: "" },
            ],
        });
    };

    const updateContributor = (index: number, designation: string) => {
        const em = getEndMatter();
        const newList = [...em.contributorParticulars];
        newList[index] = { ...newList[index], designation };
        updateEndMatter({ contributorParticulars: newList });
    };

    const removeContributor = (index: number) => {
        const em = getEndMatter();
        updateEndMatter({
            contributorParticulars: em.contributorParticulars.filter((_, i) => i !== index).map((c, i) => ({ ...c, number: i + 1 })),
        });
    };

    const addPlagiarismEntry = () => {
        const em = getEndMatter();
        updateEndMatter({
            plagiarismChecking: {
                ...em.plagiarismChecking,
                checkerEntries: [...em.plagiarismChecking.checkerEntries, { method: "", date: "" }],
            },
        });
    };

    const updatePlagiarismEntry = (index: number, updates: Partial<{ method: string; date: string }>) => {
        const em = getEndMatter();
        const newEntries = [...em.plagiarismChecking.checkerEntries];
        newEntries[index] = { ...newEntries[index], ...updates };
        updateEndMatter({ plagiarismChecking: { ...em.plagiarismChecking, checkerEntries: newEntries } });
    };

    const removePlagiarismEntry = (index: number) => {
        const em = getEndMatter();
        updateEndMatter({
            plagiarismChecking: {
                ...em.plagiarismChecking,
                checkerEntries: em.plagiarismChecking.checkerEntries.filter((_, i) => i !== index),
            },
        });
    };

    // ─── Render ───────────────────────────────────────────────
    const tabClasses = (tab: string) =>
        `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${editTab === tab
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            : "text-stone-500 hover:bg-stone-100"
        }`;

    return (
        <div className="paper-editor-fullwidth">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <a href="/dashboard/papers" className="text-stone-400 hover:text-stone-600 transition-colors">
                        <ChevronLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-lg font-bold text-stone-900">{paper.submissionTitle}</h1>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span>Template: {paper.templateName}</span>
                            <span>·</span>
                            <span className={`font-bold uppercase tracking-wider ${paper.status === "final" ? "text-emerald-600" : "text-amber-600"}`}>
                                {paper.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {mode === "preview" ? (
                        <>
                            <button onClick={handleStartEdit}
                                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors">
                                <Edit size={14} /> Edit Content
                            </button>
                            {paper.status === "draft" && (
                                <button onClick={handleMarkFinal}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                                    Mark as Final
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={handleCancelEdit}
                                className="px-4 py-2 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            {mode === "edit" && editData ? (
                <div className="flex gap-4" style={{ height: "calc(100vh - 180px)" }}>
                    {/* Edit Panel */}
                    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-stone-100 overflow-hidden flex flex-col">
                        {/* Edit Tabs */}
                        <div className="flex gap-1 p-3 border-b border-stone-100 shrink-0">
                            <button className={tabClasses("content")} onClick={() => setEditTab("content")}>Content</button>
                            <button className={tabClasses("references")} onClick={() => setEditTab("references")}>References</button>
                            <button className={tabClasses("metadata")} onClick={() => setEditTab("metadata")}>Metadata</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* ─── Content Tab ─────────────────────── */}
                            {editTab === "content" && (
                                <>
                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                                        <textarea
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm resize-none"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Abstract */}
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Abstract</label>
                                        <RichTextEditor
                                            value={editData.abstract}
                                            onChange={(v) => setEditData({ ...editData, abstract: v })}
                                            minHeight="100px"
                                            maxHeight="200px"
                                            compact
                                        />
                                    </div>

                                    {/* Keywords */}
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Keywords (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={editData.keywords.join(", ")}
                                            onChange={(e) => setEditData({ ...editData, keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) })}
                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                                        />
                                    </div>

                                    {/* Body Sections */}
                                    <div className="pt-3 border-t border-stone-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Body Sections</span>
                                            <button onClick={addSection}
                                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                                <Plus size={12} /> Add Section
                                            </button>
                                        </div>

                                        {editData.body.length === 0 && (
                                            <div className="text-xs text-stone-400 text-center py-6 bg-stone-50 rounded-lg">
                                                No sections yet. Click "Add Section" to start writing.
                                            </div>
                                        )}

                                        {editData.body.map((section: PaperSection, i: number) => (
                                            <details key={i} className="mb-3 bg-stone-50 rounded-xl border border-stone-100 group" open>
                                                <summary className="flex items-center gap-2 p-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                                                    <ChevronDown size={14} className="text-stone-400 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
                                                    <span className="text-xs font-semibold text-stone-600 flex-1">Section {i + 1}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={(e) => { e.preventDefault(); moveSectionUp(i); }} disabled={i === 0}
                                                            className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-[10px] p-0.5">▲</button>
                                                        <button onClick={(e) => { e.preventDefault(); moveSectionDown(i); }} disabled={i === editData.body.length - 1}
                                                            className="text-stone-300 hover:text-stone-600 disabled:opacity-30 text-[10px] p-0.5">▼</button>
                                                        <button onClick={(e) => { e.preventDefault(); removeSection(i); }} className="text-red-400 hover:text-red-600 p-0.5 ml-1">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </summary>
                                                <div className="px-3 pb-3">
                                                    <RichTextEditor
                                                        value={section.content}
                                                        onChange={(html) => updateSection(i, { content: html })}
                                                        minHeight="120px"
                                                        maxHeight="400px"
                                                        placeholder={`Write section content…`}
                                                    />
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* ─── References Tab ──────────────────── */}
                            {editTab === "references" && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">References</span>
                                        <button onClick={addReference}
                                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                            <Plus size={12} /> Add Reference
                                        </button>
                                    </div>

                                    {editData.references.length === 0 && (
                                        <div className="text-xs text-stone-400 text-center py-6 bg-stone-50 rounded-lg">
                                            No references yet. Click "Add Reference" to get started.
                                        </div>
                                    )}

                                    {editData.references.map((ref, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <span className="text-xs font-mono text-stone-400 mt-2 min-w-[24px]">[{i + 1}]</span>
                                            <textarea
                                                value={ref.text}
                                                onChange={(e) => updateReference(i, e.target.value)}
                                                className="flex-1 px-2 py-1.5 rounded border border-stone-200 text-xs resize-none"
                                                rows={2}
                                                placeholder="Reference text..."
                                            />
                                            <button onClick={() => removeReference(i)} className="text-red-400 hover:text-red-600 mt-2">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* ─── Metadata Tab ────────────────────── */}
                            {editTab === "metadata" && (
                                <>
                                    {/* Contributor Particulars */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Particulars of Contributors</span>
                                            <button onClick={addContributor}
                                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                        {getEndMatter().contributorParticulars.map((c, i) => (
                                            <div key={i} className="flex gap-2 items-start mb-2">
                                                <span className="text-xs font-mono text-stone-400 mt-2 min-w-[16px]">{i + 1}.</span>
                                                <input value={c.designation}
                                                    onChange={(e) => updateContributor(i, e.target.value)}
                                                    className="flex-1 px-2 py-1.5 rounded border border-stone-200 text-xs"
                                                    placeholder="Designation, Department, Institution..." />
                                                <button onClick={() => removeContributor(i)} className="text-red-400 hover:text-red-600 mt-1">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Corresponding Author */}
                                    <div className="pt-3 border-t border-stone-100">
                                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Corresponding Author</span>
                                        <div className="space-y-2">
                                            <input value={getEndMatter().correspondingAuthor.name}
                                                onChange={(e) => updateEndMatter({ correspondingAuthor: { ...getEndMatter().correspondingAuthor, name: e.target.value } })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Name" />
                                            <textarea value={getEndMatter().correspondingAuthor.address}
                                                onChange={(e) => updateEndMatter({ correspondingAuthor: { ...getEndMatter().correspondingAuthor, address: e.target.value } })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs resize-none" rows={2} placeholder="Address" />
                                            <input value={getEndMatter().correspondingAuthor.email}
                                                onChange={(e) => updateEndMatter({ correspondingAuthor: { ...getEndMatter().correspondingAuthor, email: e.target.value } })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Email" />
                                        </div>
                                    </div>

                                    {/* Author Declaration */}
                                    <div className="pt-3 border-t border-stone-100">
                                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Author Declaration</span>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-[10px] text-stone-500">Competing Interests</label>
                                                <input value={getEndMatter().authorDeclaration.competingInterests}
                                                    onChange={(e) => updateEndMatter({ authorDeclaration: { ...getEndMatter().authorDeclaration, competingInterests: e.target.value } })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-stone-500">Ethics Committee Approval?</label>
                                                <input value={getEndMatter().authorDeclaration.ethicsApproval}
                                                    onChange={(e) => updateEndMatter({ authorDeclaration: { ...getEndMatter().authorDeclaration, ethicsApproval: e.target.value } })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Yes / No / NA" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-stone-500">Informed Consent?</label>
                                                <input value={getEndMatter().authorDeclaration.informedConsent}
                                                    onChange={(e) => updateEndMatter({ authorDeclaration: { ...getEndMatter().authorDeclaration, informedConsent: e.target.value } })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Yes / No / NA" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plagiarism */}
                                    <div className="pt-3 border-t border-stone-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Plagiarism Checking</span>
                                            <button onClick={addPlagiarismEntry}
                                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                        {getEndMatter().plagiarismChecking.checkerEntries.map((entry, i) => (
                                            <div key={i} className="flex gap-2 items-center mb-2">
                                                <input value={entry.method}
                                                    onChange={(e) => updatePlagiarismEntry(i, { method: e.target.value })}
                                                    className="flex-1 px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Method" />
                                                <input value={entry.date}
                                                    onChange={(e) => updatePlagiarismEntry(i, { date: e.target.value })}
                                                    className="w-32 px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Date" />
                                                <button onClick={() => removePlagiarismEntry(i)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="mt-2">
                                            <label className="text-[10px] text-stone-500">Image Consent</label>
                                            <input value={getEndMatter().plagiarismChecking.imageConsent ?? ""}
                                                onChange={(e) => updateEndMatter({ plagiarismChecking: { ...getEndMatter().plagiarismChecking, imageConsent: e.target.value } })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="NA" />
                                        </div>
                                    </div>

                                    {/* Pharmacology & Emendations */}
                                    <div className="pt-3 border-t border-stone-100 space-y-2">
                                        <div>
                                            <label className="text-[10px] text-stone-500">Pharmacology</label>
                                            <input value={getEndMatter().pharmacology ?? ""}
                                                onChange={(e) => updateEndMatter({ pharmacology: e.target.value })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="Author Origin" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-stone-500">Emendations</label>
                                            <input value={getEndMatter().emendations ?? ""}
                                                onChange={(e) => updateEndMatter({ emendations: e.target.value })}
                                                className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" placeholder="0" />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="pt-3 border-t border-stone-100">
                                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">Dates</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] text-stone-500">Submission</label>
                                                <input value={getEndMatter().dateOfSubmission ?? ""}
                                                    onChange={(e) => updateEndMatter({ dateOfSubmission: e.target.value })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-stone-500">Peer Review</label>
                                                <input value={getEndMatter().dateOfPeerReview ?? ""}
                                                    onChange={(e) => updateEndMatter({ dateOfPeerReview: e.target.value })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-stone-500">Acceptance</label>
                                                <input value={getEndMatter().dateOfAcceptance ?? ""}
                                                    onChange={(e) => updateEndMatter({ dateOfAcceptance: e.target.value })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-stone-500">Publishing</label>
                                                <input value={getEndMatter().dateOfPublishing ?? ""}
                                                    onChange={(e) => updateEndMatter({ dateOfPublishing: e.target.value })}
                                                    className="w-full px-2 py-1.5 rounded border border-stone-200 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="w-[45%] shrink-0 bg-white rounded-2xl border border-stone-100 overflow-hidden">
                        <PaperPreview config={templateConfig} data={editData} />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
                    {templateConfig ? (
                        <PaperPreview config={templateConfig} data={paperData} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400 text-sm">
                            Template configuration not available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const PaperEditor = withConvex(PaperEditorInner);
export default PaperEditor;
