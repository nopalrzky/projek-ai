import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import FeatureHero from "./Partials/FeatureHero";
import FeaturePainPoints from "./Partials/FeaturePainPoints";
import FeatureHighlights from "./Partials/FeatureHighlights";
import InteractiveAffiliateSimulator from "./Partials/InteractiveAffiliateSimulator";
import DetailedSections from "./Partials/DetailedSections";
import UseCases from "./Partials/UseCases";
import FeatureBenefits from "./Partials/FeatureBenefits";
import FeatureComparison from "./Partials/FeatureComparison";
import FeatureFAQ from "./Partials/FeatureFAQ";
import FeatureCTAFinal from "./Partials/FeatureCTAFinal";
import { affiliateProgramData } from "@/Data/Features/AffiliateProgram";

const AffiliateProgram: React.FC = () => {
    const pageBackground = {
        background: `
            radial-gradient(ellipse 80% 45% at 0% 0%, color-mix(in srgb, var(--color-purple-500) 16%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 70% 40% at 100% 12%, color-mix(in srgb, var(--color-purple-600) 14%, transparent) 0%, transparent 58%),
            linear-gradient(180deg, var(--color-background) 0%, var(--color-gray-50) 42%, var(--color-background) 100%)
        `,
    };

    return (
        <>
            <Head title="Program Afiliasi - WashWallet | Kemitraan & Komisi Koin Laundry" />

            <GuestLayout
                showNavigation={true}
                showFooter={true}
                isFullWidth={true}
            >
                <div
                    className="relative w-full overflow-hidden"
                    style={pageBackground}
                >
                    <div className="relative z-10">
                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-left" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-right" />
                            <FeatureHero
                                data={affiliateProgramData.hero}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-right" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-left" />
                            <FeaturePainPoints
                                data={affiliateProgramData.painPoints}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-left" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-right" />
                            <FeatureHighlights
                                data={affiliateProgramData.highlights}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-right" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-left" />
                            <InteractiveAffiliateSimulator />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-left" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-right" />
                            <DetailedSections
                                data={affiliateProgramData.detailedSections}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-right" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-left" />
                            <UseCases
                                data={{
                                    badge: "Studi Kasus",
                                    headline: "Skenario Program Kemitraan",
                                    subheadline:
                                        "Bagaimana laundry memanfaatkan sistem referral kemitraan untuk saling merekomendasikan layanan",
                                    accentColor: "var(--color-purple-500)",
                                    accentBg: "var(--color-purple-50)",
                                    accentBorder: "var(--color-purple-200)",
                                    cases: affiliateProgramData.useCases,
                                }}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-left" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-right" />
                            <FeatureBenefits
                                data={affiliateProgramData.benefits}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-right" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-left" />
                            <FeatureComparison
                                data={affiliateProgramData.comparison}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-left" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-right" />
                            <FeatureFAQ
                                data={affiliateProgramData.faqs}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-purple-primary glow-top-right" />
                            <div className="glow-orb glow-orb-purple-secondary glow-bottom-left" />
                            <FeatureCTAFinal
                                data={affiliateProgramData.ctaFinal}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
};

export default AffiliateProgram;
