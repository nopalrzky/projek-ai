export interface FeatureHeroData {
    badge: string;
    headline: string;
    headlineHighlight: string;
    subheadline: string;
    highlights: string[];
    accentColor: string;
    accentBg: string;
    accentBorder: string;
    accentStrongColor?: string;
    orbColor?: string;
}

export interface FeatureHeroProps {
    data: FeatureHeroData;
    primaryCtaText?: string;
    primaryCtaHref?: string;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
    hideGlow?: boolean;
}

export interface PainPointItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface FeaturePainPointsData {
    badge: string;
    headline: string;
    subheadline: string;
    items: PainPointItem[];
    accentColor: string;
    accentBg: string;
    accentBorder: string;
}

export interface FeaturePainPointsProps {
    data: FeaturePainPointsData;
    hideGlow?: boolean;
}
export type FeatureSectionHeaderLayout = "center" | "split";

export interface FeatureHighlightItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

export interface FeatureHighlightsData {
    badge: string;
    headline: string;
    subheadline: string;
    items: FeatureHighlightItem[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface FeatureHighlightsProps {
    data: FeatureHighlightsData;
    hideGlow?: boolean;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface ShowcaseTab {
    id: string;
    label: string;
    mockup: React.ReactNode;
}

export interface VisualShowcaseData {
    badge: string;
    headline: string;
    subheadline: string;
    tabs: ShowcaseTab[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface VisualShowcaseProps {
    data: VisualShowcaseData;
}

export interface DetailedSection {
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    bgColor: string;
}

export interface DetailedSectionsData {
    badge: string;
    headline: string;
    subheadline: string;
    sections: DetailedSection[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface DetailedSectionsProps {
    data: DetailedSectionsData;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface EcosystemPlatform {
    platform: string;
    target: string;
    features: string[];
    status: "Tersedia" | "Coming Soon";
    device: "desktop" | "mobile";
}

export interface EcosystemSectionData {
    badge: string;
    headline: string;
    subheadline: string;
    platforms: EcosystemPlatform[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface EcosystemSectionProps {
    data: EcosystemSectionData;
}

export interface UseCase {
    persona: string;
    scenario: string;
    outcome: string;
    accentColor: string;
}

export interface UseCasesData {
    badge: string;
    headline: string;
    subheadline: string;
    cases: UseCase[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface UseCasesProps {
    data: UseCasesData;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface ComparisonRow {
    aspect: string;
    manual: string;
    washwallet: string;
}

export interface FeatureComparisonData {
    badge: string;
    headline: string;
    subheadline: string;
    rows: ComparisonRow[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface FeatureComparisonProps {
    data: FeatureComparisonData;
    hideGlow?: boolean;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface FeatureFAQItem {
    question: string;
    answer: string;
}

export interface FeatureFAQData {
    badge: string;
    headline: string;
    subheadline: string;
    items: FeatureFAQItem[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface FeatureFAQProps {
    data: FeatureFAQData;
    hideGlow?: boolean;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface FeatureCTAFinalData {
    badge: string;
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaHref: string;
    secondaryCtaText: string;
    whatsappNumber?: string;
    whatsappMessage: string;
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface FeatureCTAFinalProps {
    data: FeatureCTAFinalData;
    hideGlow?: boolean;
    headerLayout?: FeatureSectionHeaderLayout;
}

export interface BenefitItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    benefits: string[];
}

export interface FeatureBenefitsData {
    badge: string;
    headline: string;
    subheadline: string;
    items: BenefitItem[];
    accentColor?: string;
    accentBg?: string;
    accentBorder?: string;
}

export interface FeatureBenefitsProps {
    data: FeatureBenefitsData;
    hideGlow?: boolean;
    headerLayout?: FeatureSectionHeaderLayout;
}
