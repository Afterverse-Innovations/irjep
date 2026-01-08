export default function AimScopePage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Aim & Scope</h1>

            <div className="bg-stone-50 border border-stone-200 p-8 rounded-lg mb-10">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4">Core Objectives</h2>
                <ul className="space-y-3 text-stone-700">
                    <li className="flex items-start"><span className="mr-3 text-primary">•</span> To advance scholarly research in ethnomedicine.</li>
                    <li className="flex items-start"><span className="mr-3 text-primary">•</span> To support ethical documentation of traditional healthcare practices.</li>
                    <li className="flex items-start"><span className="mr-3 text-primary">•</span> To foster interdisciplinary engagement between research and practice.</li>
                </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <section>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">In Scope</h3>
                    <p className="text-stone-600 mb-4">IRJEP publishes original research articles, review articles, and case studies related to:</p>
                    <ul className="list-disc pl-5 space-y-2 text-stone-700">
                        <li>Ayurveda and allied traditional systems (Siddha, Unani)</li>
                        <li>Folk and tribal medicine</li>
                        <li>Ethnobotany and traditional pharmacology</li>
                        <li>Comparative studies of traditional medical practices</li>
                        <li>Medical anthropology and sociology of health</li>
                        <li>Integrative healthcare models</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Out of Scope</h3>
                    <div className="bg-red-50 border border-red-100 p-6 rounded-md">
                        <ul className="list-disc pl-5 space-y-2 text-stone-700">
                            <li>Submissions that are purely promotional in nature.</li>
                            <li>Articles lacking proper scholarly references or methodology.</li>
                            <li>Unsubstantiated medical claims without empirical or observational basis.</li>
                            <li>Studies that violate ethical standards regarding human or animal subjects.</li>
                        </ul>
                    </div>
                </section>
            </div>

            <section className="mt-12 pt-12 border-t border-stone-200">
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">Intended Audience</h3>
                <p className="text-stone-700">
                    The journal is intended for academic researchers, medical and AYUSH practitioners, policymakers, and students
                    involved in ethnomedicine, ethnopharmacology, and public health fields.
                </p>
            </section>
        </div>
    );
}
