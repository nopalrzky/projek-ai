import React from "react";
import { Sparkles, Waves, LucideIcon } from "lucide-react";

interface FeatureItem {
    icon: LucideIcon;
    title: string;
    desc: string;
    delay?: string;
}

interface StatItem {
    num: string;
    label: string;
}

interface AuthSplitPanelProps {
    badge: string;
    heading: React.ReactNode;
    subheading: string;
    features: FeatureItem[];
    stats: StatItem[];
}

const AuthSplitPanel: React.FC<AuthSplitPanelProps> = ({
    badge,
    heading,
    subheading,
    features,
    stats,
}) => (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col bg-gradient-to-br from-primary-600 via-primary-500 to-primary-900">
        <div className="absolute bottom-0 left-0 right-0 w-full opacity-10 pointer-events-none overflow-hidden h-[200px]">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
                <path fill="white" d="M0,192L60,186.7C120,181,240,171,360,181.3C480,192,600,224,720,218.7C840,213,960,171,1080,160C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 w-full opacity-[0.06] pointer-events-none overflow-hidden h-[260px]">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
                <path fill="white" d="M0,64L80,96C160,128,320,192,480,192C640,192,800,128,960,117.3C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
            </svg>
        </div>

        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full blur-3xl pointer-events-none bg-white/[0.08]" />
        <div className="absolute bottom-[20%] left-[-60px] w-64 h-64 rounded-full blur-3xl pointer-events-none bg-white/[0.06]" />

        <div className="relative z-10 flex flex-col h-full p-14">
            <div className="flex items-center gap-3 mb-auto">
                <div className="p-2.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                    WashWallet
                </span>
            </div>

            <div className="my-auto space-y-10 max-w-lg">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/25 bg-white/12 text-xs font-semibold tracking-wide uppercase text-white/90">
                        <Waves className="w-3 h-3" />
                        {badge}
                    </div>
                    <h2 className="text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight">
                        {heading}
                    </h2>
                    <p className="text-base leading-relaxed font-medium max-w-sm text-white/65">
                        {subheading}
                    </p>
                </div>

                <div className="space-y-3">
                    {features.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-4 p-4 rounded-2xl group hover:translate-x-1 transition-transform duration-300 animate-fadeInUp bg-white/[0.07] border border-white/12 backdrop-blur-sm"
                            style={{ animationDelay: item.delay ?? "0ms" }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/15">
                                <item.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{item.title}</p>
                                <p className="text-xs mt-0.5 text-white/60">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-6 mt-auto pt-8">
                {stats.map((s) => (
                    <div key={s.label}>
                        <p className="text-2xl font-extrabold text-white">{s.num}</p>
                        <p className="text-xs font-medium mt-0.5 text-white/55">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default AuthSplitPanel;
