import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import FeatureHero from "./Partials/FeatureHero";
import FeaturePainPoints from "./Partials/FeaturePainPoints";
import FeatureHighlights from "./Partials/FeatureHighlights";
import InteractiveWorkflowSimulator from "./Partials/InteractiveWorkflowSimulator";
import DetailedSections from "./Partials/DetailedSections";
import UseCases from "./Partials/UseCases";
import FeatureBenefits from "./Partials/FeatureBenefits";
import FeatureComparison from "./Partials/FeatureComparison";
import FeatureFAQ from "./Partials/FeatureFAQ";
import FeatureCTAFinal from "./Partials/FeatureCTAFinal";
import { operationalManagementData } from "@/Data/Features/OperationalManagement";

const OperationalManagement: React.FC = () => {
    const pageBackground = {
        background: `
            radial-gradient(ellipse 80% 45% at 0% 0%, color-mix(in srgb, var(--color-primary-500) 16%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 70% 40% at 100% 12%, color-mix(in srgb, var(--color-secondary-500) 14%, transparent) 0%, transparent 58%),
            linear-gradient(180deg, var(--color-background) 0%, var(--color-gray-50) 42%, var(--color-background) 100%)
        `,
    };

    return (
        <>
            <Head title="Manajemen Operasional - WashWallet | Kelola Laundry dari Satu Dashboard" />

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
                            <div className="glow-orb glow-orb-primary glow-top-left" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-right" />
                            <FeatureHero 
                                data={operationalManagementData.hero} 
                                hideGlow={true} 
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-right" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-left" />
                            <FeaturePainPoints
                                data={operationalManagementData.painPoints}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-left" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-right" />
                            <FeatureHighlights
                                data={operationalManagementData.highlights}
                                hideGlow={true}
                            />
                        </div>

                        {/* Interactive Simulator Section with consistent glow and class structure */}
                        <div className="glow-section-wrapper">
                            <InteractiveWorkflowSimulator />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-right" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-left" />
                            <DetailedSections
                                data={operationalManagementData.detailedSections}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-left" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-right" />
                            <UseCases
                                data={{
                                    badge: "Studi Kasus",
                                    headline: "Skenario Operasional Riil",
                                    subheadline: "Bagaimana alur kerja WashWallet menyelesaikan masalah operasional di lapangan secara riil",
                                    cases: operationalManagementData.useCases
                                }}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-right" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-left" />
                            <FeatureBenefits
                                data={operationalManagementData.benefits}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-left" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-right" />
                            <FeatureComparison
                                data={operationalManagementData.comparison}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-right" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-left" />
                            <FeatureFAQ 
                                data={operationalManagementData.faqs} 
                                hideGlow={true} 
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-primary glow-top-left" />
                            <div className="glow-orb glow-orb-secondary glow-bottom-right" />
                            <FeatureCTAFinal
                                data={operationalManagementData.ctaFinal}
                                hideGlow={true}
                            />
                        </div>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
};

export default OperationalManagement;
