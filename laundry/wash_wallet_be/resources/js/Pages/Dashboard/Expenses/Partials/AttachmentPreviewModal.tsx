import { Expense } from "@/types";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Download, ExternalLink, Image as ImageIcon } from "lucide-react";

interface AttachmentPreviewModalProps {
    isOpen: boolean;
    expense?: Expense;
    onClose: () => void;
}

function AttachmentPreviewModal({
    isOpen,
    expense,
    onClose,
}: AttachmentPreviewModalProps) {
    const attachmentUrl = expense?.attachmentUrl ?? expense?.attachment;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={expense?.code ?? "Lampiran Pengeluaran"}
            size="2xl"
            scrollable={false}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    {attachmentUrl && (
                        <Button
                            variant="primary"
                            onClick={() =>
                                window.open(
                                    attachmentUrl,
                                    "_blank",
                                    "noopener,noreferrer",
                                )
                            }
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Buka di Tab Baru
                        </Button>
                    )}
                </div>
            }
        >
            {attachmentUrl ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-gray-50)] p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                                {expense?.description ||
                                    expense?.code ||
                                    "Lampiran Pengeluaran"}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                Klik gambar atau tombol buka untuk melihat
                                ukuran penuh
                            </p>
                        </div>
                    </div>

                    <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-gray-100)]"
                    >
                        <img
                            src={attachmentUrl}
                            alt="Preview lampiran pengeluaran"
                            className="max-h-[70vh] w-full object-contain"
                        />
                    </a>

                    <div className="flex justify-end">
                        <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                                color: "var(--color-primary-600)",
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Unduh Lampiran
                        </a>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)]">
                        <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Lampiran tidak tersedia
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                            Data lampiran tidak ditemukan untuk pengeluaran ini
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default AttachmentPreviewModal;
