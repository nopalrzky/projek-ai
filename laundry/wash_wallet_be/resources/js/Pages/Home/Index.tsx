import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import Hero from "./Partials/Hero";
import About from "./Partials/About";
import Problems from "./Partials/Problems";
import HowItWorks from "./Partials/HowItWorks";
import Feature from "./Partials/Feature";
import ROICalculator from "./Partials/ROICalculator";
import Comparison from "./Partials/Comparison";
import RiskReversal from "./Partials/RiskReversal";
import FAQ from "./Partials/Faq";
import PricingSection from "./Partials/PricingSection";
import CTAFinal from "./Partials/CTAFinal";

const Home: React.FC = () => (
    <>
        <Head title="Home - WashWallet | Aset Digital untuk Pengusaha Laundry" />

        <GuestLayout showNavigation={true} showFooter={true} isFullWidth={true}>
            <Hero />
            <About />
            <Problems />
            <Feature />
            <ROICalculator />
            <HowItWorks />
            <Comparison />
            <PricingSection />
            <RiskReversal />
            <FAQ />
            <CTAFinal />
        </GuestLayout>
    </>
);

export default Home;
