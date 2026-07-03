import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Building2 } from "lucide-react";
import { Card } from "@/Components/Card";
import { SelectInput } from "@/Components/Input";
import SectionTitle from "./SectionTitle";
import ModeButton from "./ModeButton";
import { formatCurrency } from "@/lib/utils";

interface Outlet {
    id: number;
    name: string;
    code: string;
    coinBalance?: number;
}

interface TopupDestinationSectionProps {
    topupMode: "master" | "outlet";
    onModeChange: (mode: "master" | "outlet") => void;
    outlets: Outlet[];
    outletId: number | null | undefined;
    onOutletChange: (id: number | null) => void;
    selectedOutlet: Outlet | null;
    outletError?: string;
    processing: boolean;
}

const TopupDestinationSection = ({
    topupMode,
    onModeChange,
    outlets,
    outletId,
    onOutletChange,
    selectedOutlet,
    outletError,
    processing,
}: TopupDestinationSectionProps) => {
    return (
        <Card className="p-6">
            <SectionTitle
                number={1}
                title="Tujuan Topup"
                subtitle="Pilih ke mana saldo akan dikreditkan"
                color="var(--color-primary-600)"
                bgColor="var(--color-primary-100)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ModeButton
                    active={topupMode === "master"}
                    onClick={() => onModeChange("master")}
                    icon={Wallet}
                    title="Topup Master"
                    description="Isi saldo pribadi"
                    color="success"
                    disabled={processing}
                />
                <ModeButton
                    active={topupMode === "outlet"}
                    onClick={() => onModeChange("outlet")}
                    icon={Building2}
                    title="Topup Outlet"
                    description="Isi saldo outlet"
                    color="info"
                    disabled={processing}
                />
            </div>

            <AnimatePresence>
                {topupMode === "outlet" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t overflow-hidden"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <SelectInput
                            label="Pilih Outlet"
                            placeholder="Cari outlet..."
                            value={outletId?.toString() || ""}
                            onChange={(e) =>
                                onOutletChange(
                                    e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                )
                            }
                            options={[
                                { value: "", label: "Pilih Outlet" },
                                ...outlets.map((o) => ({
                                    value: o.id.toString(),
                                    label: `${o.name} (${o.code})`,
                                })),
                            ]}
                            error={outletError}
                            required
                            disabled={processing}
                            leftIcon={<Building2 className="w-5 h-5" />}
                            hint={
                                selectedOutlet
                                    ? `Saldo saat ini: ${formatCurrency(selectedOutlet.coinBalance || 0)}`
                                    : "Pilih outlet yang akan di-topup"
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default TopupDestinationSection;
