import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

const CoinSystem: React.FC = () => {
    return (
        <>
            <Head title="Coin & Reward System - WashWallet" />

            <GuestLayout showNavigation={true} showFooter={true}>
                <div className="w-full max-w-4xl mx-auto py-12 px-4">
                    <h1 className="text-3xl font-bold mb-4">Coin & Reward System</h1>
                    <p className="text-gray-600">Reward your customers and boost repeat orders with our integrated coin system.</p>
                </div>
            </GuestLayout>
        </>
    );
};

export default CoinSystem;
