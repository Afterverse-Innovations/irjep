import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthorGuidelinesPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h1 className="text-4xl font-serif font-bold text-stone-900">Author Guidelines</h1>
                <Link href="/submit">
                    <Button>Submit Paper</Button>
                </Link>
            </div>

            <p className="text-xl text-stone-600 mb-10 leading-relaxed">
                Authors are invited to submit original research papers, reviews, and case studies relevant to the journal’s scope.
                Please review the following guidelines carefully before submission.
            </p>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6 pb-2 border-b">Submission Categories</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-stone-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Original Research</h3>
                            <p className="text-sm text-stone-600">Full-length reports of original research. Structure: Abstract, Introduction, Materials & Methods, Results, Discussion, Conclusion.</p>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Review Papers</h3>
                            <p className="text-sm text-stone-600">Critical evaluations of material on a specific topic. Should provide a comprehensive summary of current state of knowledge.</p>
                        </div>
                        <div className="bg-stone-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Case Studies</h3>
                            <p className="text-sm text-stone-600">Reports on specific ethnomedicinal cases with detailed documentation and analysis.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Paper Preparation</h2>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700">
                        <li><strong>File Format:</strong> Microsoft Word (.doc/.docx) or PDF.</li>
                        <li><strong>Font:</strong> Times New Roman or Arial, 12 point.</li>
                        <li><strong>Spacing:</strong> Double-spaced throughout.</li>
                        <li><strong>Language:</strong> English (UK or US spelling consistent throughout).</li>
                        <li><strong>Title Page:</strong> Must include title, author names, affiliations, and corresponding author email.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Ethical Requirements</h2>
                    <p className="text-stone-700 mb-4">
                        Papers reporting studies involving human participants must include a statement regarding Ethics Committee approval and informed consent.
                        Ethnomedicine studies must respect local intellectual property and biodiversity regulations.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Review Process</h2>
                    <p className="text-stone-700">
                        The typical review process takes 4-8 weeks. Authors will be notified of the decision (Accept, Revision Required, or Reject) via email or the dashboard.
                    </p>
                </section>
            </div>
        </div>
    );
}
