import React, { useMemo } from "react";
import { Card } from "@/Components/Card";
import {
    Calendar,
    CheckCircle,
    XCircle,
    Settings2,
} from "lucide-react";
import { OperationalDay } from "@/types";
import { OutletOperationalDaysIndexProps } from "./types";
import OperationalDayAccordion from "./Partials/OperationalDayAccordion";

const OutletOperationalDaysIndex: React.FC<OutletOperationalDaysIndexProps> = ({
    outlet,
}) => {
    const operationalDays: OperationalDay[] = useMemo(() => {
        const daysOfWeek = {
            monday: "Senin",
            tuesday: "Selasa",
            wednesday: "Rabu",
            thursday: "Kamis",
            friday: "Jumat",
            saturday: "Sabtu",
            sunday: "Minggu",
        };

        return Object.entries(daysOfWeek).map(([key, label]) => {
            const existingDay = outlet.operationalDays?.find(
                (opDay) => opDay.dayOfWeek.toLowerCase() === key.toLowerCase(),
            );

            return {
                id: existingDay?.id ?? 0,
                outletId: outlet.id,
                dayOfWeek: key,
                dayLabel: label,
                isOpen: existingDay?.isOpen ?? false,
                openTime: existingDay?.openTime ?? null,
                closeTime: existingDay?.closeTime ?? null,
                isConfigured: existingDay?.isConfigured ?? false,
                status: existingDay?.status ?? "Tutup",
                duration: existingDay?.duration ?? null,
                createdAt: existingDay?.createdAt ?? "",
                updatedAt: existingDay?.updatedAt ?? "",
                outlet,
            };
        });
    }, [outlet]);

    const statistics = useMemo(() => {
        const openDays = operationalDays.filter((day) => day.isOpen).length;
        const configuredDays = operationalDays.filter(
            (day) => day.isConfigured,
        ).length;

        return {
            openDays,
            configuredDays,
            notConfiguredDays: 7 - configuredDays,
        };
    }, [operationalDays]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <CheckCircle
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{
                                    color: "var(--color-success-700)",
                                }}
                            >
                                Hari Buka
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-success-700)",
                                }}
                            >
                                {statistics.openDays}
                                <span className="text-sm font-normal ml-1">
                                    hari
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Settings2
                                className="w-6 h-6"
                                style={{ color: "var(--color-info-600)" }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "var(--color-info-700)" }}
                            >
                                Sudah Dikonfigurasi
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-info-700)" }}
                            >
                                {statistics.configuredDays}
                                <span className="text-sm font-normal ml-1">
                                    / 7
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <XCircle
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{
                                    color: "var(--color-warning-700)",
                                }}
                            >
                                Belum Dikonfigurasi
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-warning-700)",
                                }}
                            >
                                {statistics.notConfiguredDays}
                                <span className="text-sm font-normal ml-1">
                                    hari
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                        }}
                    >
                        <Calendar
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>
                    <div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Jam Operasional Outlet
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Kelola jadwal buka-tutup outlet {outlet.name}
                        </p>
                    </div>
                </div>

                <OperationalDayAccordion 
                    outlet={outlet} 
                    operationalDays={operationalDays} 
                />
            </Card>
        </div>
    );
};

export default OutletOperationalDaysIndex;
