export default function PoliciesPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-10">Journal Policies</h1>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Peer Review Policy</h2>
                    <p className="text-stone-700 leading-relaxed">
                        All papers submitted to IRJEP undergo initial editorial evaluation to check for scope and basic standards.
                        Papers passing this stage are subject to a <strong>double-blind peer review</strong> by at least two independent subject experts.
                        Reviewers remain anonymous to authors, and authors to reviewers. Editorial decisions are based on academic quality,
                        originality, validity of findings, and ethical compliance.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Publication Ethics</h2>
                    <p className="text-stone-700 leading-relaxed mb-4">
                        IRJEP is committed to upholding the highest standards of publication ethics. We adhere to guidelines
                        referenced by the Committee on Publication Ethics (COPE).
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700">
                        <li><strong>Authorship:</strong> Must be limited to those who have made a significant contribution to the conception, design, execution, or interpretation of the reported study.</li>
                        <li><strong>Conflicts of Interest:</strong> All authors must disclose any financial or personal relationships that could be viewed as influencing their work.</li>
                        <li><strong>Data Integrity:</strong> Fabrication or falsification of data is serious misconduct and grounds for immediate rejection or retraction.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Plagiarism Policy</h2>
                    <p className="text-stone-700 leading-relaxed">
                        Submitted papers must be original and appropriately cited. IRJEP uses similarity checking software to screen for plagiarism.
                        Any paper found to have significant unoriginal content without proper attribution will be rejected.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Disclaimer</h2>
                    <p className="text-stone-700 leading-relaxed italic border-l-4 border-stone-300 pl-4 py-2">
                        Content published in IRJEP is intended for academic and research purposes only and does not constitute medical advice.
                        Readers should not use the information for diagnosing or treating a health problem or disease without consulting a qualified healthcare provider.
                    </p>
                </section>
            </div>
        </div>
    );
}
