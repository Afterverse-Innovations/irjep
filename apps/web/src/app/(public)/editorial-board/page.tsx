export default function EditorialBoardPage() {
    const editorialMembers = [
        { name: "Dr. A. Sharma", role: "Editor-in-Chief", affiliation: "Institute of Ethnomedicine, India" },
        { name: "Prof. John Smith", role: "Associate Editor", affiliation: "Dept. of Anthropology, University of X" },
        { name: "Dr. Sarah Lee", role: "Managing Editor", affiliation: "Global Health Research Centre" },
        // Add more mock members
    ];

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Editorial Board</h1>

            <p className="text-stone-600 mb-12 max-w-2xl leading-relaxed">
                The Editorial Board of IRJEP consists of researchers and practitioners with expertise in ethnomedicine,
                traditional healthcare systems, and interdisciplinary research methods. The board oversees editorial standards,
                peer review processes, and publication ethics.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                {editorialMembers.map((member, index) => (
                    <div key={index} className="flex flex-col p-6 bg-white border border-stone-200 rounded-lg shadow-sm">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{member.role}</span>
                        <h3 className="text-xl font-bold text-stone-900 mb-1">{member.name}</h3>
                        <p className="text-stone-500 text-sm">{member.affiliation}</p>
                    </div>
                ))}
            </div>

            <div className="mt-16 bg-stone-50 p-8 rounded-lg">
                <h3 className="text-lg font-bold text-stone-900 mb-3">Join Our Reviewer Panel</h3>
                <p className="text-stone-600 mb-4">
                    We are always looking for qualified subject matter experts to join our peer review panel.
                    If you have expertise in ethnomedicine, botany, or related fields, please contact the editorial office.
                </p>
                <a href="/contact" className="text-primary font-medium hover:underline">Contact Editorial Office &rarr;</a>
            </div>
        </div>
    );
}
