import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import type { TabItem } from "@/Components/Tabs";
import {
    Building2,
    Lock,
    Pencil,
    Settings,
    User,
    Users,
    Wallet,
} from "lucide-react";
import PageHeader from "@/Components/Page/PageHeader";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import ProfileSidebar from "./Partials/ProfileSidebar";
import ProfileOverview from "./Partials/ProfileOverview";
import OutletsTab from "./Outlets/Index";
import FinanceTab from "./Finance/Index";
import ReferralsTab from "./Referrals/Index";
import type { ProfileIndexProps } from "./types";
import SettingsTab from "./Partials/SettingsTab";

function ProfileIndex({
    user,
    overview,
    outlets,
    financeSummary,
    referralSummary,
    setupChecklist,
}: ProfileIndexProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (!user) {
        return (
            <>
                <Head title="Profile" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-secondary">
                        Data profil tidak tersedia
                    </p>
                </div>
            </>
        );
    }

    const tabs: TabItem[] = [
        {
            label: "Overview",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Finance",
            icon: <Wallet className="w-4 h-4" />,
        },
        {
            label: "Outlets",
            icon: <Building2 className="w-4 h-4" />,
            badge: outlets.length > 0 ? outlets.length : undefined,
            badgeVariant: "primary" as const,
        },
        {
            label: "Referrals",
            icon: <Users className="w-4 h-4" />,
            badge:
                referralSummary.totalReferrals > 0
                    ? referralSummary.totalReferrals
                    : undefined,
            badgeVariant: "secondary" as const,
        },
        {
            label: "Settings",
            icon: <Settings className="w-4 h-4" />,
        },
    ];
    return (
        <>
            <Head title={`Profile - ${user.name}`} />

            <div className="p-4 md:p-6 space-y-6 mx-auto">
                <PageHeader
                    title="Profil Saya"
                    subtitle={`Kelola informasi akun, outlet, finance, referral, dan pengaturan untuk @${user.username}`}
                    icon={User}
                    actions={
                        <>
                            <Button
                                href={route("profile.change-password")}
                                variant="outline"
                                leftIcon={<Lock className="w-4 h-4" />}
                            >
                                Change Password
                            </Button>
                            <Button
                                href={route("profile.edit")}
                                variant="primary"
                                leftIcon={<Pencil className="w-4 h-4" />}
                            >
                                Edit Profile
                            </Button>
                        </>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <ProfileSidebar user={user} overview={overview} />
                    </div>

                    <div className="lg:col-span-3">
                        <Tabs
                            tabs={tabs}
                            selectedIndex={activeTab}
                            onChange={setActiveTab}
                            variant="underline"
                            size="md"
                            animated
                            scrollable
                        >
                            <ProfileOverview
                                overview={overview}
                                setupChecklist={setupChecklist}
                            />
                            <FinanceTab financeSummary={financeSummary} />
                            <OutletsTab outlets={outlets} />
                            <ReferralsTab referralSummary={referralSummary} />
                            <SettingsTab user={user} />
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}

ProfileIndex.layout = withAuthenticatedLayout({
    title: "Profil Saya",
    searchable: false,
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Profil", href: "#" },
    ],
});

export default ProfileIndex;
