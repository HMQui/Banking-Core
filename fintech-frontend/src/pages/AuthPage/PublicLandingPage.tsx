import { Lock, Zap, CreditCard, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PublicLandingPage() {
    const features = [
        {
            icon: <Lock className="w-5 h-5 text-blue-800" />,
            title: "Ironclad Security",
            description:
                "Multi-factor authentication and 256-bit encryption protocols keeping your assets safe 24/7.",
        },
        {
            icon: <Zap className="w-5 h-5 text-blue-800" />,
            title: "Instant Transfers",
            description:
                "Send and receive funds globally in seconds. No more waiting for traditional banking delays.",
        },
        {
            icon: <CreditCard className="w-5 h-5 text-blue-800" />,
            title: "Multi-Account",
            description:
                "Manage checking, savings, and investment accounts from a single, unified dashboard.",
        },
    ];
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            {/* --- Hero Content --- */}
            <div className="max-w-3xl text-center mb-20">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    Next-Generation <br className="hidden sm:block" />
                    <span className="text-blue-900">Secure Banking</span>
                </h1>

                <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Experience military-grade security combined with a seamless interface. Manage
                    multi-currency accounts and execute instant global transfers with zero friction.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <button
                        className="w-full sm:w-auto px-8 py-3.5 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate("/auth")}
                    >
                        Get Started
                    </button>

                    <button className="w-full sm:w-auto px-6 py-3.5 text-slate-600 font-medium rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-2">
                        Learn More
                        <PlayCircle className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* --- Features Grid --- */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300"
                    >
                        <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex items-center justify-center mb-6">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
