import React from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    FileText,
    ImageIcon,
    Download,
    ExternalLink,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FineLogOverviewProps } from "../types";

const FineLogOverview: React.FC<FineLogOverviewProps> = ({ fineLog }) => {
    return (
        <div className="space-y-6">
            {/* Fine Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6">
                    <h2
                        className="text-xl font-semibold mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Detail Denda
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fine Type */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <AlertCircle
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jenis Denda
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fineLog.fine?.name || "N/A"}
                                </p>
                                {fineLog.fine?.description && (
                                    <p
                                        className="text-sm mt-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {fineLog.fine.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-warning-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jumlah Denda
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    {formatCurrency(fineLog.amount)}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Calendar
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tanggal Denda
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(fineLog.date, "DD MMMM YYYY")}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        fineLog.status === "paid"
                                            ? "var(--color-success-100)"
                                            : fineLog.status === "unpaid"
                                              ? "var(--color-warning-100)"
                                              : "var(--color-error-100)",
                                }}
                            >
                                <AlertCircle
                                    className="w-5 h-5"
                                    style={{
                                        color:
                                            fineLog.status === "paid"
                                                ? "var(--color-success-600)"
                                                : fineLog.status === "unpaid"
                                                  ? "var(--color-warning-600)"
                                                  : "var(--color-error-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Status Pembayaran
                                </p>
                                <Badge
                                    variant={
                                        fineLog.status === "paid"
                                            ? "success"
                                            : fineLog.status === "unpaid"
                                              ? "warning"
                                              : "error"
                                    }
                                >
                                    {fineLog.status === "paid"
                                        ? "Lunas"
                                        : fineLog.status === "unpaid"
                                          ? "Belum Dibayar"
                                          : "Dibatalkan"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Reason */}
            {fineLog.reason && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Alasan Denda
                                </h3>
                                <p
                                    className="text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {fineLog.reason}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Attachment */}
            {fineLog.hasAttachment && fineLog.attachmentUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                {fineLog.isAttachmentImage ? (
                                    <ImageIcon
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                ) : (
                                    <FileText
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="text-lg font-semibold mb-4"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Lampiran
                                </h3>

                                {fineLog.isAttachmentImage ? (
                                    <div className="space-y-4">
                                        <img
                                            src={fineLog.attachmentUrl}
                                            alt="Attachment"
                                            className="rounded-lg max-w-md w-full border"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="p-4 rounded-lg border flex items-center justify-between"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText
                                                className="w-8 h-8"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            />
                                            <div>
                                                <p
                                                    className="font-medium"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    File Lampiran
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {fineLog.attachmentExtension?.toUpperCase()}{" "}
                                                    • {fineLog.attachmentSize}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {fineLog.attachmentSize && (
                                    <p
                                        className="text-xs mt-2"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Ukuran file: {fineLog.attachmentSize}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Payroll Info (if paid) */}
            {fineLog.status === "paid" && fineLog.payroll && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Informasi Pembayaran
                                </h3>
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Denda ini telah dipotong dari gaji pada
                                    periode:{" "}
                                    <span
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {fineLog.payroll.periodLabel}
                                    </span>
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        (window.location.href = route(
                                            "payrolls.show",
                                            fineLog.payroll!.id,
                                        ))
                                    }
                                    leftIcon={
                                        <ExternalLink className="w-4 h-4" />
                                    }
                                >
                                    Lihat Detail Penggajian
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default FineLogOverview;
