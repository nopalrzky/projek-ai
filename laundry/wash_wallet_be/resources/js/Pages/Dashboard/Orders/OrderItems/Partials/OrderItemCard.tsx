import React, { useState } from "react";
import { 
    Package, Clock, ChevronDown, 
    TrendingUp, CheckCircle2, Play, Circle, User, Eye, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import ProcessDetailModal from "./ProcessDetailModal";
import { OrderItemCardProps } from "../types";

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<any>(null);

    const processes = item.orderItemProcesses || [];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "done":
                return "success";
            case "processing":
                return "info";
            default:
                return "secondary";
        }
    };

    return (
        <Card
            variant="default"
            className="overflow-hidden border border-[var(--color-border)] transition-all duration-300 hover:shadow-lg bg-[var(--color-surface)]"
        >
            <div
                className="p-4 cursor-pointer hover:bg-[var(--color-gray-50)] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-lg text-[var(--color-text-primary)]">
                                {item.laundryServiceName}
                            </h4>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] border-none">
                                    {item.categoryName}
                                </Badge>
                                <span className={`text-sm flex items-center gap-1 font-medium ${
                                    item.status === "done" 
                                        ? "text-[var(--color-success-600)]" 
                                        : "text-[var(--color-text-tertiary)]"
                                }`}>
                                    <Clock className="w-3.5 h-3.5" /> 
                                    {item.status || "Pending"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                Kuantitas
                            </p>
                            <p className="font-bold text-[var(--color-text-primary)]">
                                {item.quantity}{" "}
                                <span className="text-xs font-normal text-[var(--color-text-tertiary)]">
                                    {item.unitName}
                                </span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                Total
                            </p>
                            <p className="font-bold text-[var(--color-primary-600)] text-lg">
                                {item.formattedTotalAmount ||
                                    formatCurrency(item.totalAmount)}
                            </p>
                        </div>
                        <div
                            className={`p-1.5 rounded-full transition-transform duration-300 border border-[var(--color-border-light)] ${
                                isExpanded ? "rotate-180 bg-[var(--color-gray-100)]" : "bg-transparent"
                            }`}
                        >
                            <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-[var(--color-background)] overflow-hidden"
                    >
                        <div className="p-4 border-t border-[var(--color-border-light)] space-y-5">
                            <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-primary-500)]" /> 
                                    Progres Produksi
                                </h5>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-success-50)] border border-[var(--color-success-100)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)]" />
                                        <span className="text-[10px] font-bold text-[var(--color-success-700)]">
                                            Done: {processes.filter((p: any) => p.status === "done").length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-info-50)] border border-[var(--color-info-100)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-info-500)]" />
                                        <span className="text-[10px] font-bold text-[var(--color-info-700)]">
                                            Total: {processes.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {processes.map((process: any) => (
                                    <div
                                        key={process.id}
                                        className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between group hover:border-[var(--color-primary-300)] transition-all cursor-default shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                                    process.status === "done"
                                                        ? "bg-[var(--color-success-50)] text-[var(--color-success-600)]"
                                                        : process.status === "processing"
                                                        ? "bg-[var(--color-info-50)] text-[var(--color-info-600)] animate-pulse"
                                                        : "bg-[var(--color-gray-50)] text-[var(--color-gray-400)]"
                                                }`}
                                            >
                                                {process.status === "done" ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : process.status === "processing" ? (
                                                    <Play className="w-5 h-5 fill-current" />
                                                ) : (
                                                    <Circle className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">
                                                    {process.processName || process.laundryServiceProcess?.process?.name}
                                                </p>
                                                <p className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1.5 font-medium uppercase">
                                                    <User className="w-2.5 h-2.5" />{" "}
                                                    {process.employeeName || process.employee?.name || "Belum ditentukan"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 rounded-full bg-[var(--color-gray-50)] hover:bg-[var(--color-primary-50)] text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-600)] transition-colors p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProcess({
                                                    ...process,
                                                    processName: process.processName || process.laundryServiceProcess?.process?.name,
                                                    employeeName: process.employeeName || process.employee?.name,
                                                    sequenceNumber: process.sequenceNumber || process.laundryServiceProcess?.sequence
                                                });
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {processes.length === 0 && (
                                    <div className="col-span-full py-10 text-center text-sm text-[var(--color-text-tertiary)] border border-dashed rounded-2xl bg-[var(--color-background)] border-[var(--color-border)]">
                                        <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>Data proses produksi belum tersedia</p>
                                    </div>
                                )}
                            </div>

                            {item.itemNotes && (
                                <div className="p-4 rounded-xl bg-[var(--color-warning-50)] dark:bg-[var(--color-warning-900)]/10 border border-[var(--color-warning-100)] dark:border-[var(--color-warning-900)]/20 flex gap-3 shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-100)] dark:bg-[var(--color-warning-800)]/30 flex items-center justify-center flex-shrink-0">
                                        <Info className="w-5 h-5 text-[var(--color-warning-600)] dark:text-[var(--color-warning-400)]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-[var(--color-warning-700)] dark:text-[var(--color-warning-300)] uppercase tracking-widest">
                                            Catatan Item
                                        </p>
                                        <p className="text-sm text-[var(--color-warning-900)] dark:text-[var(--color-warning-200)]">
                                            {item.itemNotes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedProcess && (
                <ProcessDetailModal
                    process={selectedProcess}
                    isOpen={!!selectedProcess}
                    onClose={() => setSelectedProcess(null)}
                />
            )}
        </Card>
    );
};

export default OrderItemCard;
