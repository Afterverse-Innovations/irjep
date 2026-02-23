import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import {
    Save, Copy, Trash2, ChevronLeft,
    FileText, Type, Columns3, PanelTop,
    PanelBottom, Table, BookOpen, Hash, Space,
} from "lucide-react";
import { toast } from "sonner";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { DEFAULT_TEMPLATE_CONFIG } from "@/lib/template-defaults";
import { PaperPreview } from "@/components/paper-renderer/PaperPreview";
import { PageSettings } from "./panels/PageSettings";
import { TypographySettings } from "./panels/TypographySettings";
import { LayoutSettings } from "./panels/LayoutSettings";
import { HeaderSettings } from "./panels/HeaderSettings";
import { FooterSettings } from "./panels/FooterSettings";
import { TableSettings } from "./panels/TableSettings";
import { ReferenceSettings } from "./panels/ReferenceSettings";
import { NumberingSettings } from "./panels/NumberingSettings";
import { SpacingSettings } from "./panels/SpacingSettings";
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
    body: `<h2>Introduction</h2><p>The landscape of educational research has undergone significant transformation in recent years. The proliferation of digital technologies, coupled with evolving pedagogical frameworks, has necessitated a re-examination of traditional research methodologies. This paper aims to provide a thorough analysis of current methodological practices in higher education research.</p><h2>Literature Review</h2><p>Previous studies have explored various aspects of educational research methodology. Smith and Jones (2022) highlighted the growing importance of mixed-methods research designs, while Brown et al. (2023) emphasized the role of technology in data collection and analysis processes.</p><h2>Methodology</h2><p>A systematic review approach was adopted, following the PRISMA guidelines. A total of 250 peer-reviewed articles from major educational research journals were selected based on predefined inclusion criteria spanning the period of 2020 to 2025.</p><h2>Results</h2><p>The analysis reveals that 45% of the reviewed studies employed mixed-methods designs, representing a 15% increase from the previous five-year period. Qualitative approaches accounted for 30% of studies, while purely quantitative designs constituted the remaining 25%.</p><h2>Discussion</h2><p>The findings indicate a clear paradigm shift in educational research methodology. The increasing adoption of mixed-methods approaches reflects a growing recognition of the complexity inherent in educational phenomena and the need for multi-dimensional inquiry frameworks.</p><h2>Conclusion</h2><p>This systematic review provides evidence of a significant methodological evolution in higher education research. The shift toward mixed-methods approaches, technology-enhanced data collection, and interdisciplinary frameworks suggests a maturing field.</p>`,
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
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout", label: "Layout", icon: Columns3 },
    { id: "header", label: "Header", icon: PanelTop },
    { id: "footer", label: "Footer", icon: PanelBottom },
    { id: "table", label: "Tables", icon: Table },
    { id: "reference", label: "References", icon: BookOpen },
    { id: "numbering", label: "Numbering", icon: Hash },
    { id: "spacing", label: "Spacing", icon: Space },
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

    // Convex operations
    const existingTemplate = useQuery(
        api.templates.getById,
        templateId ? { id: templateId as any } : "skip"
    );
    const createTemplate = useMutation(api.templates.create);
    const updateTemplate = useMutation(api.templates.update);
    const cloneTemplate = useMutation(api.templates.clone);
    const removeTemplate = useMutation(api.templates.remove);

    // Load existing template data
    useEffect(() => {
        if (existingTemplate) {
            setName(existingTemplate.name);
            setDescription(existingTemplate.description ?? "");
            setVersion(existingTemplate.version);
            setConfig(existingTemplate.config as JournalTemplateConfig);
        }
    }, [existingTemplate]);

    // Config updater with dirty tracking
    const updateConfig = useCallback(<K extends keyof JournalTemplateConfig>(
        section: K,
        value: Partial<JournalTemplateConfig[K]>
    ) => {
        setConfig((prev) => ({
            ...prev,
            [section]: { ...prev[section], ...value },
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
                        {activeTab === "typography" && <TypographySettings config={config.typography} onChange={(v) => updateConfig("typography", v)} />}
                        {activeTab === "layout" && <LayoutSettings config={config.layout} onChange={(v) => updateConfig("layout", v)} />}
                        {activeTab === "header" && <HeaderSettings config={config.header} onChange={(v) => updateConfig("header", v)} />}
                        {activeTab === "footer" && <FooterSettings config={config.footer} onChange={(v) => updateConfig("footer", v)} />}
                        {activeTab === "table" && <TableSettings config={config.table} onChange={(v) => updateConfig("table", v)} />}
                        {activeTab === "reference" && <ReferenceSettings config={config.reference} onChange={(v) => updateConfig("reference", v)} />}
                        {activeTab === "numbering" && <NumberingSettings config={config.numbering} onChange={(v) => updateConfig("numbering", v)} />}
                        {activeTab === "spacing" && <SpacingSettings config={config.spacing} onChange={(v) => updateConfig("spacing", v)} />}
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-stone-100">
                    <PaperPreview config={config} data={SAMPLE_PAPER_DATA} />
                </div>
            </div>
        </div>
    );
}

const TemplateBuilder = withConvex(TemplateBuilderInner);
export default TemplateBuilder;
