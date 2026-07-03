import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    QrCode,
    Store,
    CreditCard,
    ChevronUp,
    ChevronDown,
    Check,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { cn } from "@/lib/utils";
import SectionTitle from "./SectionTitle";
import { TopupFormData } from "@/types/topup";

const BANK_CHANNELS = [
    { id: "bca", method: "bank_transfer", name: "BCA" },
    { id: "bni", method: "bank_transfer", name: "BNI" },
    { id: "bri", method: "bank_transfer", name: "BRI" },
    { id: "cimb", method: "bank_transfer", name: "CIMB Niaga" },
    { id: "mandiri", method: "echannel", name: "Mandiri" },
    { id: "permata", method: "permata", name: "Permata" },
];

const CSTORE_CHANNELS = [
    { id: "alfamart", name: "Alfamart", desc: "40,000+ outlet terdekat" },
    { id: "indomaret", name: "Indomaret", desc: "18,000+ outlet terdekat" },
];

const CARDLESS_CHANNELS = [
    {
        id: "akulaku",
        name: "Akulaku",
        desc: "Cicilan 0% dengan tenor 1, 3, 6, atau 12 bulan",
    },
    {
        id: "kredivo",
        name: "Kredivo",
        desc: "Bayar sekarang atau cicilan 0% hingga 12 bulan",
    },
];

interface PaymentOptionCardProps {
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const PaymentOptionCard = ({
    isSelected,
    onClick,
    disabled,
    children,
}: PaymentOptionCardProps) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
            "p-4 rounded-lg border transition-all flex flex-col justify-center gap-3 group relative text-left",
            isSelected
                ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-300)]",
        )}
    >
        {isSelected && (
            <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary-500)" }}
            >
                <Check className="w-3 h-3 text-white" />
            </div>
        )}
        {children}
    </button>
);

interface AccordionItemProps {
    id: string;
    openAccordion: string | null;
    onToggle: (id: string) => void;
    icon: React.ReactNode;
    iconBgColor: string;
    iconColor: string;
    title: string;
    children: React.ReactNode;
    gridCols?: string;
}

const AccordionItem = ({
    id,
    openAccordion,
    onToggle,
    icon,
    iconBgColor,
    iconColor,
    title,
    children,
    gridCols = "grid-cols-2 lg:grid-cols-3",
}: AccordionItemProps) => {
    const isOpen = openAccordion === id;
    return (
        <div
            className="border rounded-xl overflow-hidden shadow-sm"
            style={{ borderColor: "var(--color-border)" }}
        >
            <button
                type="button"
                onClick={() => onToggle(id)}
                className="w-full flex items-center justify-between p-4 transition-colors"
                style={{ backgroundColor: "var(--color-surface)" }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--color-surface-muted)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--color-surface)";
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: iconBgColor,
                            color: iconColor,
                        }}
                    >
                        {icon}
                    </div>
                    <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {title}
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp
                        className="w-5 h-5"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                ) : (
                    <ChevronDown
                        className="w-5 h-5"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={cn(
                            "p-4 border-t grid gap-3",
                            gridCols,
                        )}
                        style={{
                            backgroundColor: "var(--color-background)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface TopupPaymentSectionProps {
    data: TopupFormData;
    openAccordion: string | null;
    onAccordionToggle: (id: string) => void;
    onSelectBank: (method: string, bankCode: string) => void;
    onSelectGopay: () => void;
    onSelectCstore: (storeId: string) => void;
    onSelectCardless: (providerId: string) => void;
    processing: boolean;
}

const TopupPaymentSection = ({
    data,
    openAccordion,
    onAccordionToggle,
    onSelectBank,
    onSelectGopay,
    onSelectCstore,
    onSelectCardless,
    processing,
}: TopupPaymentSectionProps) => {
    return (
        <Card className="p-6">
            <SectionTitle
                number={3}
                title="Metode Pembayaran"
                subtitle="Pilih metode transfer Virtual Account"
                color="var(--color-warning-600)"
                bgColor="var(--color-warning-100)"
            />

            <div className="mt-6 space-y-4">
                <AccordionItem
                    id="bank"
                    openAccordion={openAccordion}
                    onToggle={onAccordionToggle}
                    icon={<Building2 className="w-5 h-5" />}
                    iconBgColor="var(--color-warning-50)"
                    iconColor="var(--color-warning-600)"
                    title="Virtual Account (Bank Transfer)"
                    gridCols="grid-cols-2 lg:grid-cols-3"
                >
                    {BANK_CHANNELS.map((bank) => (
                        <button
                            key={bank.id}
                            type="button"
                            disabled={processing}
                            onClick={() => onSelectBank(bank.method, bank.id)}
                            className={cn(
                                "p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-3 group relative",
                                data.bankCode === bank.id
                                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-300)]",
                            )}
                        >
                            {data.bankCode === bank.id && (
                                <div
                                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-500)",
                                    }}
                                >
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                            <div className="w-14 h-9 rounded bg-white shadow-sm border border-[var(--color-gray-100)] flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                <img
                                    src={`/assets/images/banks/${bank.id}.webp`}
                                    alt={bank.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span
                                className={cn(
                                    "text-[11px] font-semibold text-center leading-tight",
                                    data.bankCode === bank.id
                                        ? "text-[var(--color-primary-700)]"
                                        : "text-[var(--color-text-secondary)]",
                                )}
                            >
                                {bank.name} Virtual Account
                            </span>
                        </button>
                    ))}
                </AccordionItem>

                <AccordionItem
                    id="ewallet"
                    openAccordion={openAccordion}
                    onToggle={onAccordionToggle}
                    icon={<QrCode className="w-5 h-5" />}
                    iconBgColor="var(--color-info-50)"
                    iconColor="var(--color-info-600)"
                    title="E-Wallet / QRIS"
                    gridCols="grid-cols-1 md:grid-cols-2"
                >
                    <PaymentOptionCard
                        isSelected={data.paymentMethod === "gopay"}
                        onClick={onSelectGopay}
                        disabled={processing}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                <img
                                    src="/assets/images/ewallet/gopay.webp"
                                    alt="GoPay"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <div
                                    className="font-bold text-sm leading-tight mb-0.5"
                                    style={{
                                        color:
                                            data.paymentMethod === "gopay"
                                                ? "var(--color-primary-700)"
                                                : "var(--color-text-primary)",
                                    }}
                                >
                                    GoPay / QRIS
                                </div>
                                <div
                                    className="text-[11px] leading-snug font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Bayar lewat fitur scan aplikasi QRIS (GoPay,
                                    OVO, Dana, dll) atau langsung di-app GoPay
                                </div>
                            </div>
                        </div>
                    </PaymentOptionCard>
                </AccordionItem>

                <AccordionItem
                    id="cstore"
                    openAccordion={openAccordion}
                    onToggle={onAccordionToggle}
                    icon={<Store className="w-5 h-5" />}
                    iconBgColor="var(--color-error-50)"
                    iconColor="var(--color-error-600)"
                    title="Over the Counter (Minimarket)"
                    gridCols="grid-cols-1 md:grid-cols-2"
                >
                    {CSTORE_CHANNELS.map((store) => {
                        const isSelected =
                            data.paymentMethod === "cstore" &&
                            data.cstoreType === store.id;
                        return (
                            <PaymentOptionCard
                                key={store.id}
                                isSelected={isSelected}
                                onClick={() => onSelectCstore(store.id)}
                                disabled={processing}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                        <img
                                            src={`/assets/images/cstore/${store.id}.webp`}
                                            alt={store.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div
                                            className="font-bold text-sm leading-tight mb-0.5"
                                            style={{
                                                color: isSelected
                                                    ? "var(--color-primary-700)"
                                                    : "var(--color-text-primary)",
                                            }}
                                        >
                                            {store.name}
                                        </div>
                                        <div
                                            className="text-[11px] leading-snug font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {store.desc}
                                        </div>
                                    </div>
                                </div>
                            </PaymentOptionCard>
                        );
                    })}
                </AccordionItem>

                <AccordionItem
                    id="cardless"
                    openAccordion={openAccordion}
                    onToggle={onAccordionToggle}
                    icon={<CreditCard className="w-5 h-5" />}
                    iconBgColor="var(--color-primary-50)"
                    iconColor="var(--color-primary-600)"
                    title="Cicilan Tanpa Kartu Kredit"
                    gridCols="grid-cols-1 md:grid-cols-2"
                >
                    {CARDLESS_CHANNELS.map((provider) => {
                        const isSelected =
                            data.paymentMethod === provider.id;
                        return (
                            <PaymentOptionCard
                                key={provider.id}
                                isSelected={isSelected}
                                onClick={() => onSelectCardless(provider.id)}
                                disabled={processing}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full shadow border-2 border-white bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                                        <img
                                            src={`/assets/images/cardless/${provider.id}.webp`}
                                            alt={provider.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div
                                            className="font-bold text-sm leading-tight mb-0.5"
                                            style={{
                                                color: isSelected
                                                    ? "var(--color-primary-700)"
                                                    : "var(--color-text-primary)",
                                            }}
                                        >
                                            {provider.name}
                                        </div>
                                        <div
                                            className="text-[11px] leading-snug font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {provider.desc}
                                        </div>
                                    </div>
                                </div>
                            </PaymentOptionCard>
                        );
                    })}
                </AccordionItem>
            </div>
        </Card>
    );
};

export default TopupPaymentSection;
