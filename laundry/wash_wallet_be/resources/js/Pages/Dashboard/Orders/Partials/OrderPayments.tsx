import React, { useState } from "react";
import { motion } from "framer-motion";
import { router, Link, useForm } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/Components/Modal";
import { Input, Select, TextAreaInput } from "@/Components/Input";
import { FormField } from "@/Components/Form";
import { OrderPaymentMethod } from "@/types/order";
import {
    CreditCard,
    Banknote,
    Smartphone,
    Clock,
    CheckCircle,
    Plus,
    Trash2,
    User,
    FileText,
    History,
    AlertCircle,
    Receipt,
} from "lucide-react";
import { OrderPaymentsProps } from "../types";

const OrderPayments: React.FC<OrderPaymentsProps> = ({ order }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            amount: order.remainingAmount || 0,
            payment_method: "cash" as OrderPaymentMethod,
            reference_number: "",
            notes: "",
        });

    const handleOpenModal = () => {
        setData({
            amount: order.remainingAmount || 0,
            payment_method: "cash",
            reference_number: "",
            notes: "",
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("orders.payment.store", order.id), {
            onSuccess: () => {
                handleCloseModal();
            },
        });
    };

    const handleDeletePayment = (paymentLogId: number) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus log pembayaran ini? Tindakan ini akan mengembalikan sisa tagihan pesanan.",
            )
        ) {
            router.delete(
                route("orders.payment.destroy", { id: order.id, paymentLogId }),
            );
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "cash":
                return <Banknote className="w-4 h-4" />;
            case "transfer":
                return <CreditCard className="w-4 h-4" />;
            case "qris":
                return <Smartphone className="w-4 h-4" />;
            case "debit":
                return <CreditCard className="w-4 h-4" />;
            default:
                return <CreditCard className="w-4 h-4" />;
        }
    };

    const paymentProgress =
        order.totalAmount > 0
            ? (order.paidAmount / order.totalAmount) * 100
            : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Section 1: Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Ringkasan Pembayaran
                                </h3>
                                <Badge
                                    variant={
                                        order.paymentStatusBadgeVariant as any
                                    }
                                >
                                    {order.paymentStatusLabel}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Total Tagihan
                                        </p>
                                        <p
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {order.formattedTotalAmount}
                                        </p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Sudah Dibayar
                                        </p>
                                        <p className="text-xl font-bold text-[var(--color-success-600)]">
                                            {order.formattedPaidAmount}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Progres Pelunasan
                                        </span>
                                        <span
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {Math.round(paymentProgress)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-[var(--color-gray-100)] rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${paymentProgress}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeOut",
                                            }}
                                            className="h-full bg-[var(--color-success-500)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--color-primary-700)]">
                                    Sisa Tagihan
                                </p>
                                <p className="text-lg font-bold text-[var(--color-primary-900)]">
                                    {order.formattedRemainingAmount}
                                </p>
                            </div>
                            {order.canPay && (
                                <Button
                                    onClick={handleOpenModal}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Catat Pembayaran
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                        <Receipt className="w-8 h-8 text-[var(--color-primary-600)]" />
                    </div>
                    <div>
                        <p
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Metode Utama
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {order.paymentMethod
                                ? order.paymentMethod.toUpperCase()
                                : "Belum ditentukan"}
                        </p>
                    </div>
                    <div
                        className="text-xs italic"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Sistem mendukung pembayaran bertahap dengan metode yang
                        berbeda-beda.
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-[var(--color-primary-500)]" />
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Riwayat Transaksi ({order.orderPaymentLogsCount || 0})
                    </h3>
                </div>

                {!order.orderPaymentLogs ||
                order.orderPaymentLogs.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-gray-50)] flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-[var(--color-gray-300)]" />
                        </div>
                        <p className="text-[var(--color-text-secondary)]">
                            Belum ada riwayat pembayaran untuk pesanan ini.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-gray-200)] before:to-transparent">
                        {order.orderPaymentLogs.map((log) => (
                            <div
                                key={log.id}
                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-primary-500)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>

                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-lg font-bold text-[var(--color-success-600)]">
                                            {log.formattedAmount}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            leftIcon={
                                                getPaymentMethodIcon(
                                                    log.paymentMethod,
                                                )
                                            }
                                        >
                                            {log.paymentMethodLabel}
                                        </Badge>
                                    </div>

                                    {log.referenceNumber && (
                                        <div
                                            className="flex items-center gap-1.5 text-xs mb-2"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            <FileText className="w-3 h-3" />
                                            <span>
                                                Ref: {log.referenceNumber}
                                            </span>
                                        </div>
                                    )}

                                    {log.notes && (
                                        <p
                                            className="text-sm p-2 rounded bg-[var(--color-gray-50)] italic mb-3"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {log.notes}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--color-gray-100)]">
                                        <div className="flex flex-col">
                                            <div
                                                className="flex items-center gap-1 text-xs mb-1"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                <Clock className="w-3 h-3" />
                                                {log.formattedCreatedAt}
                                            </div>
                                            {log.employee && (
                                                <Link
                                                    href={route(
                                                        "employees.show",
                                                        log.employee.id,
                                                    )}
                                                    className="flex items-center gap-1 text-xs font-medium hover:underline text-[var(--color-primary-600)]"
                                                >
                                                    <User className="w-3 h-3" />
                                                    {log.employee.name}
                                                </Link>
                                            )}
                                        </div>

                                        {log.canBeDeleted && (
                                            <button
                                                onClick={() =>
                                                    handleDeletePayment(log.id)
                                                }
                                                className="p-2 rounded-lg text-[var(--color-error-500)] hover:bg-[var(--color-error-500)]/10 transition-colors"
                                                title="Hapus Log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md">
                <ModalHeader
                    title="Catat Pembayaran Baru"
                    onClose={handleCloseModal}
                />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-[var(--color-primary-50)] flex items-center gap-3 mb-2">
                                <AlertCircle className="w-5 h-5 text-[var(--color-primary-600)]" />
                                <div>
                                    <p className="text-xs text-[var(--color-primary-700)]">
                                        Maksimal Pembayaran (Sisa Tagihan)
                                    </p>
                                    <p className="font-bold text-[var(--color-primary-900)]">
                                        {order.formattedRemainingAmount}
                                    </p>
                                </div>
                            </div>

                            <FormField
                                label="Jumlah Pembayaran (Rp)"
                                error={errors.amount}
                                required
                            >
                                <Input
                                    id="amount"
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData(
                                            "amount",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    placeholder="Masukkan nominal..."
                                    min={1}
                                    max={order.remainingAmount}
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Metode Pembayaran"
                                error={errors.payment_method}
                                required
                            >
                                <Select
                                    id="payment_method"
                                    value={data.payment_method}
                                    onChange={(e) =>
                                        setData(
                                            "payment_method",
                                            e.target
                                                .value as OrderPaymentMethod,
                                        )
                                    }
                                    required
                                    options={[
                                        {
                                            value: "cash",
                                            label: "Tunai (Cash)",
                                        },
                                        {
                                            value: "transfer",
                                            label: "Transfer Bank",
                                        },
                                        { value: "qris", label: "QRIS" },
                                        {
                                            value: "debit",
                                            label: "Kartu Debit",
                                        },
                                    ]}
                                />
                            </FormField>

                            {data.payment_method !== "cash" && (
                                <FormField
                                    label="Nomor Referensi"
                                    error={errors.reference_number}
                                >
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) =>
                                            setData(
                                                "reference_number",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="No. Ref / No. Struk..."
                                    />
                                </FormField>
                            )}

                            <FormField
                                label="Catatan (Opsional)"
                                error={errors.notes}
                            >
                                <TextAreaInput
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                    placeholder="Tambahkan catatan jika perlu..."
                                />
                            </FormField>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={handleCloseModal}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan Pembayaran"}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </motion.div>
    );
};

export default OrderPayments;
