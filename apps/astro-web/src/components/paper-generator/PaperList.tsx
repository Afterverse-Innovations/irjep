import { useQuery } from "convex/react";
import { api } from "@local-convex/_generated/api";
import { Loader2, Plus, Eye, FileCheck, FileText } from "lucide-react";
import { withConvex } from "@/components/ConvexClientProvider";

function PaperListInner() {
    const papers = useQuery(api.papers.list);

    if (papers === undefined) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading papers...
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Generated Papers</h1>
                    <p className="text-sm text-stone-500 mt-1">View and manage typeset papers</p>
                </div>
                <a
                    href="/dashboard/papers/generate"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Generate Paper
                </a>
            </div>

            {papers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
                    <FileText className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <h3 className="text-lg font-semibold text-stone-600 mb-1">No papers yet</h3>
                    <p className="text-sm text-stone-400 mb-6">Generate your first paper from an accepted submission</p>
                    <a
                        href="/dashboard/papers/generate"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={16} /> Generate Paper
                    </a>
                </div>
            ) : (
                <div className="space-y-3">
                    {papers.map((paper) => (
                        <div
                            key={paper._id}
                            className="flex items-center justify-between bg-white rounded-xl border border-stone-100 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-stone-900 truncate">
                                    {paper.submissionTitle}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                                    <span>Template: {paper.templateName}</span>
                                    <span>·</span>
                                    <span>Created {new Date(paper.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-4">
                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${paper.status === "final"
                                        ? "text-emerald-600 bg-emerald-50"
                                        : "text-amber-600 bg-amber-50"
                                    }`}>
                                    {paper.status === "final" ? <FileCheck size={10} /> : <FileText size={10} />}
                                    {paper.status}
                                </span>
                                <a
                                    href={`/dashboard/papers/${paper._id}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors"
                                >
                                    <Eye size={12} /> View
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const PaperList = withConvex(PaperListInner);
export default PaperList;
