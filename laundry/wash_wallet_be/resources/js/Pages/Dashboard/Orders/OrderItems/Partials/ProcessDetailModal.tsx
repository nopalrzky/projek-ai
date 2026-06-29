import React from "react";
import { 
    Clock, CheckCircle, 
    CheckCircle2, User, 
    Calendar, FileText, Image as ImageIcon,
    Play
} from "lucide-react";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "@/Components/Modal";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { ProcessDetailModalProps } from "../types";

const ProcessDetailModal: React.FC<ProcessDetailModalProps> = ({
    process,
    isOpen,
    onClose,
}) => {
    if (!process) return null;

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
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader
                title={`Detail Proses: ${process.processName}`}
                onClose={onClose}
            />
            <ModalBody>
                <div className="space-y-6">
                    {/* Status & Basic Info */}
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-gray-50)' }}>
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg ${
                                    process.status === "done"
                                        ? "bg-[var(--color-success-50)] text-[var(--color-success-600)]"
                                        : process.status === "processing"
                                        ? "bg-[var(--color-info-50)] text-[var(--color-info-600)]"
                                        : "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]"
                                }`}
                            >
                                {process.status === "done" ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : process.status === "processing" ? (
                                    <Play className="w-5 h-5" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                                    Status
                                </p>
                                <Badge variant={getStatusVariant(process.status)}>
                                    {process.status === "done"
                                        ? "Selesai"
                                        : process.status === "processing"
                                        ? "Diproses"
                                        : "Menunggu"}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                                Urutan
                            </p>
                            <p className="font-bold text-[var(--color-text-primary)]">
                                Ke-{process.sequenceNumber}
                            </p>
                        </div>
                    </div>

                    {/* Employee & Timing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                                <User className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                    Petugas
                                </span>
                            </div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                                {process.employeeName || "Belum ditentukan"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                                <FileText className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                    UID Petugas
                                </span>
                            </div>
                            <p className="font-medium text-[var(--color-text-primary)]">
                                {process.employeeId || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                    Mulai
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                {process.startedAt
                                    ? new Date(process.startedAt).toLocaleString(
                                          "id-ID"
                                      )
                                    : "-"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                    Selesai
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                {process.completedAt
                                    ? new Date(
                                          process.completedAt
                                      ).toLocaleString("id-ID")
                                    : "-"}
                            </p>
                        </div>
                    </div>

                    {/* Evidence if any */}
                    {process.evidence_attachment && (
                        <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                    Bukti Pengerjaan
                                </span>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                                <img
                                    src={`/storage/${process.evidence_attachment}`}
                                    alt="Bukti Pengerjaan"
                                    className="w-full h-auto object-cover max-h-60"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={onClose} className="border-[var(--color-border)] text-[var(--color-text-secondary)]">
                    Tutup
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ProcessDetailModal;
