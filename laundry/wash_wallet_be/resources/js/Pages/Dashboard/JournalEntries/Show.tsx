import { useState, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { JournalEntryShowProps } from "./types";
import { Info, FileText, Building2, Edit, Trash2 } from "lucide-react";
import JournalEntryPageHeader from "./Partials/JournalEntryPageHeader";
import JournalEntryOverview from "./Partials/JournalEntryOverview";
import JournalEntryDetailsIndex from "./JournalDetails/Index";
import JournalEntryOutlet from "./Partials/JournalEntryOutlet";
import DeleteJournalEntryModal from "./Partials/DeleteJournalEntryModal";

function JournalEntryShow({ journalEntry }: JournalEntryShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Detail Jurnal",
            icon: <FileText className="w-4 h-4" />,
            badge: journalEntry.journalDetails?.length
                ? journalEntry.journalDetails.length.toString()
                : "0",
        },
        {
            label: "Outlet",
            icon: <Building2 className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Jurnal: ${journalEntry.transactionNumber}`} />

            <div className="p-6 space-y-6  mx-auto">
                <JournalEntryPageHeader
                    journalEntry={journalEntry}
                    isLoading={isLoading}
                />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <JournalEntryOverview journalEntry={journalEntry} />

                    <JournalEntryDetailsIndex
                        journalEntry={journalEntry}
                        journalDetails={journalEntry.journalDetails || []}
                        isLoading={false}
                    />

                    {journalEntry.outlet ? (
                        <JournalEntryOutlet outlet={journalEntry.outlet} />
                    ) : (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <Building2
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                            </div>
                            <p
                                className="font-medium"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Outlet tidak tersedia
                            </p>
                        </div>
                    )}
                </Tabs>
            </div>
        </>
    );
}

JournalEntryShow.layout = withAuthenticatedLayout({
    title: "Detail Jurnal",
    searchable: false,
    breadcrumbs: [
        { label: "Jurnal", href: route("journal-entries.index") },
        { label: "Detail", href: "#" },
    ],
});

export default JournalEntryShow;
