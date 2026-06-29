import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { CoinTransactionShowProps } from "./types";
import CoinTransactionPageHeader from "./Partials/CoinTransactionPageHeader";
import CoinTransactionOverview from "./Partials/CoinTransactionOverview";

function CoinTransactionShow({ coinTransaction }: CoinTransactionShowProps) {
    return (
        <>
            <Head
                title={`${coinTransaction.typeLabel} - ${coinTransaction.amount.toLocaleString("id-ID")} Coin`}
            />

            <div className="p-6 space-y-6  mx-auto">
                <CoinTransactionPageHeader transaction={coinTransaction} />
                <CoinTransactionOverview transaction={coinTransaction} />
            </div>
        </>
    );
}

CoinTransactionShow.layout = withAuthenticatedLayout({
    title: "Detail Transaksi Coin",
    searchable: false,
    breadcrumbs: [
        { label: "Transaksi Coin", href: route("coin-transactions.index") },
        { label: "Detail", href: "#" },
    ],
});

export default CoinTransactionShow;
