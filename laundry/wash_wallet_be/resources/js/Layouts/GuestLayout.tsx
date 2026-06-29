import React from "react";
import { GuestLayoutProps } from "./types";
import GuestNavbar from "./GuestNavbar";
import GuestFooter from "./GuestFooter";

const GuestLayout: React.FC<GuestLayoutProps> = ({
    children,
    showNavigation = true,
    showFooter = true,
    isFullWidth = false,
}) => (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
        {showNavigation && <GuestNavbar />}

        <main className="flex-1 flex flex-col w-full">
            <div
                className={`flex-1 flex flex-col ${isFullWidth ? "w-full" : "container mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}
            >
                {children}
            </div>
        </main>

        {showFooter && <GuestFooter />}
    </div>
);

export default GuestLayout;
