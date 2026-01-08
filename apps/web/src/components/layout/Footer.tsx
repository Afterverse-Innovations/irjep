import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-stone-100 text-stone-600">
            <div className="container mx-auto py-10 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-serif font-bold text-stone-900">IRJEP</h3>
                        <p className="text-sm leading-relaxed">
                            International Research Journal of Ethnomedicine and Practices.<br />
                            Dedicated to the scientific study of traditional knowledge systems.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-4">Journal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-stone-900 transition-colors">About Us</Link></li>
                            <li><Link href="/aim-scope" className="hover:text-stone-900 transition-colors">Aim & Scope</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-stone-900 transition-colors">Editorial Board</Link></li>
                            <li><Link href="/policies" className="hover:text-stone-900 transition-colors">Policies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/author-guidelines" className="hover:text-stone-900 transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/submit" className="hover:text-stone-900 transition-colors">Submit Manuscript</Link></li>
                            <li><Link href="/issues" className="hover:text-stone-900 transition-colors">Archives</Link></li>
                            <li><Link href="/contact" className="hover:text-stone-900 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-4">Contact</h4>
                        <p className="text-sm mb-2">editorial@irjep.com</p>
                        <p className="text-sm">Bangalore, India</p>
                    </div>
                </div>
                <div className="mt-10 border-t border-stone-200 pt-6 text-center text-sm">
                    <p>© {new Date().getFullYear()} IRJEP. Open Access. ISSN: Pending.</p>
                </div>
            </div>
        </footer>
    );
}
