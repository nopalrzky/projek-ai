import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

const CTAFinal: React.FC = () => {
    return (
        <section className="relative py-20 px-4 overflow-hidden">
            <SectionBackground variant="alternate" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-text-primary">
                    Mulai Gratis Sekarang. Kelola Laundry Anda dengan Lebih
                    Cerdas.
                </h2>

                <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    Bergabunglah dan rasakan perbedaannya dalam 14 hari pertama.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <a
                        href="/register"
                        className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl bg-primary-600 text-white hover:bg-primary-700 active:scale-95"
                    >
                        Daftar Gratis
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                        href="https://wa.me/6281234567890"
                        className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold border transition-all duration-300 hover:scale-105 hover:shadow-xl bg-surface text-text-primary border-border hover:bg-background active:scale-95"
                    >
                        Chat via WhatsApp
                        <MessageCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTAFinal;
