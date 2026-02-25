import { useState, useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Save, Copy, Trash2, ChevronLeft, ChevronDown, ChevronRight,
    FileText, Paintbrush, Layers, Columns3, PanelTop,
    PanelBottom, Table, BookOpen, Hash, Space,
} from "lucide-react";
import { toast } from "sonner";
import type { JournalTemplateConfig, SectionKey, SectionStyle } from "@/lib/template-config";
import { resolveStyle, SECTION_KEYS, SECTION_LABELS } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/template-defaults";
import { PaperPreview } from "@/components/paper-renderer/PaperPreview";
import { PageSettings } from "./panels/PageSettings";
import { SectionStyleEditor } from "./panels/SectionStyleEditor";
import { LayoutSettings } from "./panels/LayoutSettings";
import { HeaderSettings } from "./panels/HeaderSettings";
import { FooterSettings } from "./panels/FooterSettings";
import { TableSettings } from "./panels/TableSettings";
import { ReferenceSettings } from "./panels/ReferenceSettings";
import { NumberingSettings } from "./panels/NumberingSettings";
import { withConvex } from "@/components/ConvexClientProvider";

// Sample data for live preview while building templates
const SAMPLE_PAPER_DATA: StructuredPaperData = {
    meta: { doi: "10.xxxxx/irjep.2026.001", volume: "1", issue: "1" },
    title: "A Comprehensive Study on Educational Research Methodologies in Higher Education Institutions",
    authors: [
        { name: "Dr. Jane Smith", affiliation: "Department of Education, University of Oxford", email: "jane@ox.ac.uk", isCorresponding: true },
        { name: "Prof. John Doe", affiliation: "Faculty of Social Sciences, Harvard University", isCorresponding: false },
        { name: "Dr. Alice Johnson", affiliation: "Department of Education, University of Oxford", isCorresponding: false },
    ],
    abstract: "This paper presents a comprehensive analysis of contemporary educational research methodologies employed in higher education institutions across multiple countries. Through a systematic review of 250 peer-reviewed articles published between 2020 and 2025, the study identifies emerging trends, methodological innovations, and persistent challenges in the field. The findings suggest a significant shift toward mixed-methods approaches and technology-enhanced data collection methods.",
    keywords: ["educational research", "methodology", "higher education", "systematic review", "mixed methods"],
    body: [
        { heading: "Introduction", content: "The landscape of educational research has undergone significant transformation in recent years. The proliferation of digital technologies, coupled with evolving pedagogical frameworks, has necessitated a re-examination of traditional research methodologies. This paper aims to provide a thorough analysis of current methodological practices in higher education research." },
        { heading: "Literature Review", content: "Previous studies have explored various aspects of educational research methodology. Smith and Jones (2022) highlighted the growing importance of mixed-methods research designs, while Brown et al. (2023) emphasized the role of technology in data collection and analysis processes." },
        { heading: "Methodology", content: "A systematic review approach was adopted, following the PRISMA guidelines. A total of 250 peer-reviewed articles from major educational research journals were selected based on predefined inclusion criteria spanning the period of 2020 to 2025." },
        { heading: "Results", content: "The analysis reveals that 45% of the reviewed studies employed mixed-methods designs, representing a 15% increase from the previous five-year period. Qualitative approaches accounted for 30% of studies, while purely quantitative designs constituted the remaining 25%." },
        { heading: "Discussion", content: "The findings indicate a clear paradigm shift in educational research methodology. The increasing adoption of mixed-methods approaches reflects a growing recognition of the complexity inherent in educational phenomena and the need for multi-dimensional inquiry frameworks." },
        { heading: "Conclusion", content: "This systematic review provides evidence of a significant methodological evolution in higher education research. The shift toward mixed-methods approaches, technology-enhanced data collection, and interdisciplinary frameworks suggests a maturing field." },
    ],
    tables: [
        {
            number: 1,
            caption: "Distribution of Research Methodologies (2020–2025)",
            headers: ["Methodology", "Frequency", "Percentage"],
            rows: [
                ["Mixed Methods", "112", "45%"],
                ["Qualitative", "75", "30%"],
                ["Quantitative", "63", "25%"],
            ],
        },
    ],
    references: [
        { number: 1, text: "Smith, A., & Jones, B. (2022). Mixed-methods research in education: A comprehensive guide. Educational Research Review, 15(3), 234-251." },
        { number: 2, text: "Brown, C., Davis, D., & Wilson, E. (2023). Technology-enhanced educational research methods. Journal of Educational Technology, 42(1), 78-95." },
        { number: 3, text: "Johnson, F. (2021). Qualitative research paradigms in higher education. International Journal of Higher Education, 28(4), 112-128." },
        { number: 4, text: "Williams, G., & Taylor, H. (2024). The evolution of educational research methodology: A systematic review. Research in Education, 55(2), 45-67." },
    ],
    endMatter: {
        contributorParticulars: [
            { number: 1, designation: "Associate Professor, Department of Education, University of Oxford, UK." },
            { number: 2, designation: "Professor and Head, Faculty of Social Sciences, Harvard University, USA." },
            { number: 3, designation: "Lecturer, Department of Education, University of Oxford, UK." },
        ],
        correspondingAuthor: {
            name: "Dr. Jane Smith",
            address: "Department of Education, University of Oxford, Wellington Square, Oxford OX1 2JD, United Kingdom",
            email: "jane.smith@ox.ac.uk",
        },
        authorDeclaration: {
            competingInterests: "None",
            ethicsApproval: "Yes",
            informedConsent: "Yes",
        },
        plagiarismChecking: {
            checkerEntries: [
                { method: "Plagiarism X-checker", date: "Jan 15, 2026" },
                { method: "Manual Googling", date: "Jan 20, 2026" },
                { method: "iThenticate Software", date: "Jan 25, 2026 (8%)" },
            ],
            imageConsent: "NA",
        },
        pharmacology: "Author Origin",
        emendations: "5",
        dateOfSubmission: "Oct 10, 2025",
        dateOfPeerReview: "Dec 15, 2025",
        dateOfAcceptance: "Jan 28, 2026",
        dateOfPublishing: "Mar 01, 2026",
    },
};

const TABS = [
    { id: "page", label: "Page", icon: FileText },
    { id: "global", label: "Global Style", icon: Paintbrush },
    { id: "sections", label: "Sections", icon: Layers },
    { id: "spacing", label: "Spacing", icon: Space },
    { id: "layout", label: "Layout", icon: Columns3 },
    { id: "header", label: "Header", icon: PanelTop },
    { id: "footer", label: "Footer", icon: PanelBottom },
    { id: "table", label: "Tables", icon: Table },
    { id: "reference", label: "References", icon: BookOpen },
    { id: "numbering", label: "Numbering", icon: Hash },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface TemplateBuilderProps {
    templateId?: string;  // if editing existing
}

function TemplateBuilderInner({ templateId }: TemplateBuilderProps) {
    const [activeTab, setActiveTab] = useState<TabId>("page");
    const [name, setName] = useState("Untitled Template");
    const [description, setDescription] = useState("");
    const [version, setVersion] = useState("1.0");
    const [config, setConfig] = useState<JournalTemplateConfig>(DEFAULT_TEMPLATE_CONFIG);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedPaperId, setSelectedPaperId] = useState<string>("sample");
    const [expandedSection, setExpandedSection] = useState<SectionKey | null>("title");

    // Convex operations
    const existingTemplate = useQuery(
        api.templates.getById,
        templateId ? { id: templateId as any } : "skip"
    );
    const createTemplate = useMutation(api.templates.create);
    const updateTemplate = useMutation(api.templates.update);
    const cloneTemplate = useMutation(api.templates.clone);
    const removeTemplate = useMutation(api.templates.remove);

    // Papers list for preview selector
    const papersList = useQuery(api.papers.list);

    // Resolve preview data: selected paper or sample
    const previewData: StructuredPaperData = useMemo(() => {
        if (selectedPaperId !== "sample" && papersList) {
            const found = papersList.find((p: any) => p._id === selectedPaperId);
            if (found?.renderedData) {
                const rd = found.renderedData as any;
                return {
                    ...rd,
                    body: Array.isArray(rd.body) ? rd.body : [],
                    references: Array.isArray(rd.references) ? rd.references : [],
                    tables: Array.isArray(rd.tables) ? rd.tables : [],
                    keywords: Array.isArray(rd.keywords) ? rd.keywords : [],
                    authors: Array.isArray(rd.authors) ? rd.authors : [],
                };
            }
        }
        return SAMPLE_PAPER_DATA;
    }, [selectedPaperId, papersList]);

    // Load existing template data
    useEffect(() => {
        if (existingTemplate) {
            setName(existingTemplate.name);
            setDescription(existingTemplate.description ?? "");
            setVersion(existingTemplate.version);

            const loadedConfig = (existingTemplate.config as any) || {};
            setConfig({
                ...DEFAULT_TEMPLATE_CONFIG,
                ...loadedConfig,
                sections: loadedConfig.sections ?? DEFAULT_TEMPLATE_CONFIG.sections,
                global: loadedConfig.global ?? DEFAULT_TEMPLATE_CONFIG.global,
                // Map old 'abstract' key to new 'abstractLabel' if needed
                abstractLabel: loadedConfig.abstractLabel ?? loadedConfig.abstract ?? DEFAULT_TEMPLATE_CONFIG.abstractLabel,
            });
        }
    }, [existingTemplate]);

    // Config updater with dirty tracking
    const updateConfig = useCallback(<K extends keyof JournalTemplateConfig>(
        section: K,
        value: Partial<JournalTemplateConfig[K]>
    ) => {
        setConfig((prev) => ({
            ...prev,
            [section]: { ...(prev[section] || {}), ...value },
        }));
        setIsDirty(true);
    }, []);

    // Section override updater
    const updateSectionStyle = useCallback((key: SectionKey, patch: Partial<SectionStyle>) => {
        setConfig((prev) => ({
            ...prev,
            sections: {
                ...(prev.sections || {}),
                [key]: { ...(prev.sections?.[key] || {}), ...patch },
            },
        }));
        setIsDirty(true);
    }, []);

    // Save template
    const handleSave = async () => {
        try {
            if (templateId) {
                await updateTemplate({
                    id: templateId as any,
                    name, description, version, config,
                });
                toast.success("Template updated");
            } else {
                const id = await createTemplate({ name, description, version, config });
                toast.success("Template created");
                // Navigate to edit page
                window.location.href = `/dashboard/templates/${id}`;
            }
            setIsDirty(false);
        } catch (e: any) {
            toast.error(e.message || "Failed to save template");
        }
    };

    // Save as new version
    const handleSaveAsNewVersion = async () => {
        const parts = version.split(".");
        const minor = parseInt(parts[1] || "0") + 1;
        const newVersion = `${parts[0]}.${minor}`;

        try {
            if (templateId) {
                await updateTemplate({
                    id: templateId as any,
                    name, description, version: newVersion, config,
                });
                setVersion(newVersion);
                toast.success(`Saved as version ${newVersion}`);
            }
            setIsDirty(false);
        } catch (e: any) {
            toast.error(e.message || "Failed to save");
        }
    };

    // Clone
    const handleClone = async () => {
        if (!templateId) return;
        try {
            const id = await cloneTemplate({
                sourceId: templateId as any,
                name: `${name} (Copy)`,
                version: "1.0",
            });
            toast.success("Template cloned");
            window.location.href = `/dashboard/templates/${id}`;
        } catch (e: any) {
            toast.error(e.message || "Failed to clone");
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!templateId) return;
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await removeTemplate({ id: templateId as any });
            toast.success("Template deleted");
            window.location.href = "/dashboard/templates";
        } catch (e: any) {
            toast.error(e.message || "Failed to delete");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* ─── Top Bar ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-stone-200">
                <div className="flex items-center gap-3">
                    <a href="/dashboard/templates" className="text-stone-400 hover:text-stone-600 transition-colors">
                        <ChevronLeft size={20} />
                    </a>
                    <div>
                        <input
                            value={name}
                            onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                            className="text-lg font-bold text-stone-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                            placeholder="Template Name"
                        />
                        <div className="flex items-center gap-3 text-xs text-stone-400">
                            <input
                                value={description}
                                onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                                className="bg-transparent border-none outline-none focus:ring-0 flex-1"
                                placeholder="Add description..."
                            />
                            <span className="font-mono">v{version}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span className="text-xs text-amber-600 font-medium mr-2">Unsaved changes</span>
                    )}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Save size={14} /> Save
                    </button>
                    {templateId && (
                        <>
                            <button
                                onClick={handleSaveAsNewVersion}
                                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                            >
                                Save as New Version
                            </button>
                            <button
                                onClick={handleClone}
                                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                                title="Clone Template"
                            >
                                <Copy size={14} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                title="Delete Template"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Two Column Layout ────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Config Panels */}
                <div className="w-[380px] flex flex-col border-r border-stone-200 bg-white">
                    {/* Tab Buttons */}
                    <div className="flex flex-wrap gap-1 p-3 border-b border-stone-100">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                                        }`}
                                >
                                    <Icon size={13} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === "page" && <PageSettings config={config.page} onChange={(v) => updateConfig("page", v)} />}

                        {activeTab === "global" && (
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-stone-900">Global Style</h3>
                                <p className="text-xs text-stone-400">Base style inherited by all sections unless overridden.</p>
                                <div className="p-3 bg-stone-50 rounded-lg">
                                    <SectionStyleEditor
                                        resolved={config.global}
                                        override={config.global}
                                        onChange={(patch) => updateConfig("global", patch)}
                                        showFontFamily
                                        showLineHeight
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "sections" && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-stone-900">Section Styles</h3>
                                <p className="text-xs text-stone-400 mb-3">Override global style per section.</p>
                                {SECTION_KEYS.map((key) => {
                                    const isOpen = expandedSection === key;
                                    const resolved = resolveStyle(config.global, config.sections[key]);
                                    return (
                                        <div key={key} className="border border-stone-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setExpandedSection(isOpen ? null : key)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                                            >
                                                <span className="text-xs font-semibold text-stone-700">{SECTION_LABELS[key]}</span>
                                                {isOpen ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
                                            </button>
                                            {isOpen && (
                                                <div className="p-3 border-t border-stone-100">
                                                    <SectionStyleEditor
                                                        resolved={resolved}
                                                        override={config.sections[key]}
                                                        onChange={(patch) => updateSectionStyle(key, patch)}
                                                        showFontFamily
                                                        showLineHeight={key === "bodyText" || key === "abstract"}
                                                        fontSizeRange={key === "header" || key === "footer" ? [6, 12] : [6, 28]}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === "spacing" && (
                            <div className="space-y-5">
                                <h3 className="text-sm font-bold text-stone-900">Spacing</h3>
                                <div className="space-y-3 p-3 bg-stone-50 rounded-lg">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Between Sections: {config.spacing.betweenSections}mm
                                        </label>
                                        <input type="range" min="2" max="30" step="0.5" value={config.spacing.betweenSections}
                                            onChange={(e) => updateConfig("spacing", { betweenSections: Number(e.target.value) })}
                                            className="w-full accent-emerald-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Between Paragraphs: {config.spacing.betweenParagraphs}mm
                                        </label>
                                        <input type="range" min="0" max="15" step="0.5" value={config.spacing.betweenParagraphs}
                                            onChange={(e) => updateConfig("spacing", { betweenParagraphs: Number(e.target.value) })}
                                            className="w-full accent-emerald-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            After Heading: {config.spacing.afterHeading}mm
                                        </label>
                                        <input type="range" min="1" max="15" step="0.5" value={config.spacing.afterHeading}
                                            onChange={(e) => updateConfig("spacing", { afterHeading: Number(e.target.value) })}
                                            className="w-full accent-emerald-600" />
                                    </div>
                                </div>
                                <div className="p-3 bg-stone-50 rounded-lg space-y-2">
                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Abstract Label</div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Label Text</label>
                                        <input type="text" value={config.abstractLabel.labelText}
                                            onChange={(e) => updateConfig("abstractLabel", { labelText: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={config.abstractLabel.labelBold}
                                            onChange={(e) => updateConfig("abstractLabel", { labelBold: e.target.checked })}
                                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-300" />
                                        <span className="text-xs text-stone-600">Bold label</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === "layout" && <LayoutSettings config={config.layout} onChange={(v) => updateConfig("layout", v)} />}
                        {activeTab === "header" && <HeaderSettings config={config.header} onChange={(v) => updateConfig("header", v)} />}
                        {activeTab === "footer" && <FooterSettings config={config.footer} onChange={(v) => updateConfig("footer", v)} />}
                        {activeTab === "table" && <TableSettings config={config.table} onChange={(v) => updateConfig("table", v)} />}
                        {activeTab === "reference" && <ReferenceSettings config={config.reference} onChange={(v) => updateConfig("reference", v)} />}
                        {activeTab === "numbering" && <NumberingSettings config={config.numbering} onChange={(v) => updateConfig("numbering", v)} />}
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-stone-100 flex flex-col overflow-hidden">
                    {/* Paper selector */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-stone-200 shrink-0 min-w-0">
                        <label className="text-xs font-medium text-stone-500 whitespace-nowrap">Preview with:</label>
                        <select
                            value={selectedPaperId}
                            onChange={(e) => setSelectedPaperId(e.target.value)}
                            className="min-w-0 flex-1 text-xs px-2 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:ring-1 focus:ring-emerald-300 outline-none overflow-hidden text-ellipsis"
                        >
                            <option value="sample">Sample Paper (built-in)</option>
                            {papersList?.map((p: any) => (
                                <option key={p._id} value={p._id}>
                                    {p.submissionTitle || "Untitled"} — {(p.renderedData as any)?.title || "No title"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <PaperPreview config={config} data={previewData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const TemplateBuilder = withConvex(TemplateBuilderInner);
export default TemplateBuilder;
