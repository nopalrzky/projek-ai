import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { OrderItemProcess } from "@/types";
import { Link } from "@inertiajs/react";
import {
    Briefcase,
    Phone,
    MapPin,
    Clock,
    Users,
    CheckCircle,
} from "lucide-react";
import { Badge } from "@/Components/Badge";
import { OrderEmployeeProps } from "../types";

const OrderEmployee: React.FC<OrderEmployeeProps> = ({ order }) => {
    const cashier = order.employee;

    const workers = useMemo(() => {
        const workerMap = new Map<number, any>();

        (order.orderItems || []).forEach((item) => {
            (item.orderItemProcesses || []).forEach(
                (process: OrderItemProcess) => {
                    if (process.employeeId && process.employee) {
                        const emp = process.employee;
                        if (!workerMap.has(emp.id)) {
                            workerMap.set(emp.id, {
                                employee: emp,
                                processes: [],
                            });
                        }

                        workerMap.get(emp.id).processes.push({
                            itemCategory: item.categoryName,
                            itemName:
                                item.laundryServiceName ||
                                item.laundryService?.name,
                            processName:
                                process.laundryServiceProcess?.process?.name ||
                                "Unknown Process",
                            qtyProcessed: process.qtyProcessed || item.quantity,
                            unitName: item.unitName,
                            status: process.status,
                            completedAt: process.completedAt,
                        });
                    }
                },
            );
        });

        return Array.from(workerMap.values());
    }, [order.orderItems]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                        <h2
                            className="text-lg font-semibold mb-6 flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <Briefcase className="w-5 h-5 text-[var(--color-primary-500)]" />
                            PIC Order (Kasir)
                        </h2>

                        {cashier ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center text-2xl font-bold border-2 border-[var(--color-primary-200)]">
                                        {cashier.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <Link
                                            href={route(
                                                "employees.show",
                                                cashier.id,
                                            )}
                                            className="text-xl font-bold hover:text-[var(--color-primary-600)] transition-colors border-b-2 border-transparent hover:border-[var(--color-primary-600)] pb-0.5 block"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {cashier.name}
                                        </Link>
                                        <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                                            @{cashier.username}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-[var(--color-border-light)]">
                                    <div className="flex flex-wrap gap-2">
                                        {cashier.employeePositions?.map(
                                            (pos: any, idx: number) => (
                                                <Badge
                                                    key={idx}
                                                    variant="primary"
                                                    className="bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]"
                                                >
                                                    {pos.position?.name ||
                                                        pos.positionName}
                                                </Badge>
                                            ),
                                        )}
                                        {(!cashier.employeePositions ||
                                            cashier.employeePositions.length ===
                                                0) && (
                                            <span className="text-sm text-[var(--color-text-tertiary)] italic">
                                                Posisi tidak diset
                                            </span>
                                        )}
                                    </div>

                                    {cashier.phone && (
                                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                            <Phone className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                            {cashier.phone}
                                        </div>
                                    )}

                                    {cashier.outlet && (
                                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                            <MapPin className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                            {cashier.outlet.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-[var(--color-text-tertiary)]">
                                Data kasir tidak ditemukan.
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2
                                className="text-lg font-semibold flex items-center gap-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                <Users className="w-5 h-5 text-[var(--color-primary-500)]" />
                                Karyawan Pengerjaan
                            </h2>
                            <Badge variant="default">
                                {workers.length} Pekerja
                            </Badge>
                        </div>

                        {workers.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-text-tertiary)] bg-[var(--color-gray-50)] rounded-xl border border-[var(--color-border-light)] border-dashed">
                                Belum ada karyawan yang ditugaskan untuk order
                                ini.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {workers.map((workerData, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 rounded-xl border border-[var(--color-border-light)] bg-white shadow-sm hover:border-[var(--color-primary-300)] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border-light)]">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold">
                                                {workerData.employee.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <Link
                                                href={route(
                                                    "employees.show",
                                                    workerData.employee.id,
                                                )}
                                                className="text-md font-bold hover:text-[var(--color-primary-600)] transition-colors border-b-2 border-transparent hover:border-[var(--color-primary-600)]"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {workerData.employee.name}
                                            </Link>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                                                Tugas Dikerjakan:
                                            </p>
                                            {workerData.processes.map(
                                                (proc: any, pIdx: number) => (
                                                    <div
                                                        key={pIdx}
                                                        className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[var(--color-gray-50)] rounded-lg text-sm"
                                                    >
                                                        <div>
                                                            <span className="font-medium text-[var(--color-text-primary)] block">
                                                                {proc.itemName}{" "}
                                                                (
                                                                {
                                                                    proc.processName
                                                                }
                                                                )
                                                            </span>
                                                            <span className="text-[var(--color-text-tertiary)] text-xs mt-0.5 block">
                                                                {
                                                                    proc.qtyProcessed
                                                                }{" "}
                                                                {proc.unitName ||
                                                                    "item"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {proc.status ===
                                                                "done" ||
                                                            proc.completedAt ? (
                                                                <Badge
                                                                    variant="success"
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Selesai
                                                                </Badge>
                                                            ) : proc.status ===
                                                              "processing" ? (
                                                                <Badge
                                                                    variant="primary"
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <Clock className="w-3 h-3" />
                                                                    Proses
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="warning">
                                                                    Menunggu
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderEmployee;
