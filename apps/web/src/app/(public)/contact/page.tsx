import { Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <p className="text-stone-600 leading-relaxed">
                        We welcome your enquiries regarding journal policies, submission status, or general information.
                        The editorial office aims to respond to all queries within 5–7 working days.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Mail className="mt-1 text-primary" />
                            <div>
                                <h3 className="font-bold text-stone-900">Email</h3>
                                <p className="text-stone-600 mt-1">
                                    <span className="font-medium text-stone-900">Editorial:</span> editorial@irjep.com<br />
                                    <span className="font-medium text-stone-900">Submissions:</span> submissions@irjep.com<br />
                                    <span className="font-medium text-stone-900">General:</span> contact@irjep.com
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Clock className="mt-1 text-primary" />
                            <div>
                                <h3 className="font-bold text-stone-900">Response Time</h3>
                                <p className="text-stone-600 mt-1">Monday - Friday, 9:00 AM - 5:00 PM IST</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <MapPin className="mt-1 text-primary" />
                            <div>
                                <h3 className="font-bold text-stone-900">Office</h3>
                                <p className="text-stone-600 mt-1">
                                    IRJEP Editorial Office<br />
                                    #123, Academic Enclave,<br />
                                    Bangalore, 560001, India
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simple Contact Form Shell */}
                <div className="bg-stone-50 p-8 rounded-lg border border-stone-200">
                    <h3 className="text-xl font-bold text-stone-900 mb-4">Send us a message</h3>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                            <input type="text" id="name" className="w-full rounded-md border border-stone-300 p-2" placeholder="Your Name" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                            <input type="email" id="email" className="w-full rounded-md border border-stone-300 p-2" placeholder="your@email.com" />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                            <select id="subject" className="w-full rounded-md border border-stone-300 p-2">
                                <option>General Enquiry</option>
                                <option>Submission Query</option>
                                <option>Technical Issue</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                            <textarea id="message" rows={4} className="w-full rounded-md border border-stone-300 p-2" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 transition">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
