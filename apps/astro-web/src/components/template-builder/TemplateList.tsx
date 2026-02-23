import { useQuery, useMutation } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Plus, Edit, Copy, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { withConvex } from "@/components/ConvexClientProvider";

function TemplateListInner() {
    const templates = useQuery(api.templates.list);
    const cloneTemplate = useMutation(api.templates.clone);
    const removeTemplate = useMutation(api.templates.remove);

    if (templates === undefined) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading templates...
            </div>
        );
    }

    const handleClone = async (id: string, name: string) => {
        try {
            const newId = await cloneTemplate({
                sourceId: id as any,
                name: `${name} (Copy)`,
                version: "1.0",
            });
            toast.success("Template cloned");
        } catch (e: any) {
            toast.error(e.message || "Failed to clone");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await removeTemplate({ id: id as any });
            toast.success("Template deleted");
        } catch (e: any) {
            toast.error(e.message || "Failed to delete");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Journal Templates</h1>
                    <p className="text-sm text-stone-500 mt-1">Configure page layout, typography, and styling for journal papers</p>
                </div>
                <a
                    href="/dashboard/templates/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Create Template
                </a>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                    <div className="text-stone-300 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-600 mb-1">No templates yet</h3>
                    <p className="text-sm text-stone-400 mb-6">Create your first journal template to get started</p>
                    <a
                        href="/dashboard/templates/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={16} /> Create Template
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template._id}
                            className="bg-white rounded-xl border border-stone-100 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-stone-900 truncate">{template.name}</h3>
                                    {template.description && (
                                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{template.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 ml-3">
                                    {template.isActive ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
                                            <XCircle size={10} /> Inactive
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] text-stone-400 mb-4">
                                <span className="font-mono">v{template.version}</span>
                                <span>·</span>
                                <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/dashboard/templates/${template._id}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors"
                                >
                                    <Edit size={12} /> Edit
                                </a>
                                <button
                                    onClick={() => handleClone(template._id, template.name)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors"
                                >
                                    <Copy size={12} /> Clone
                                </button>
                                <button
                                    onClick={() => handleDelete(template._id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors ml-auto"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const TemplateList = withConvex(TemplateListInner);
export default TemplateList;
