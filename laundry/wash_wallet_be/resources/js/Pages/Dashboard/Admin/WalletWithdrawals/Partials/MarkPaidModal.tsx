import React, { useState, FormEvent } from "react";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Form } from "@/Components/Form";
import { FileInput, TextAreaInput } from "@/Components/Input";
import { formatCurrency } from "@/lib/utils";
import { MarkPaidModalProps } from "../types";
import { CheckCircle2, FileText, Save } from "lucide-react";

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
    isOpen,
    withdrawal,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const [proof, setProof] = useState<File | null>(null);
    const [adminNote, setAdminNote] = useState("");

    if (!withdrawal) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onConfirm(withdrawal, { proof, adminNote });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Selesaikan Transfer Penarikan"
            variant="success"
            centered
        >
            <Form onSubmit={handleSubmit} loading={isLoading}>
                <ModalBody className="space-y-4">
                    <Card className="p-4 space-y-2">
                        <p
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Rekening Tujuan
                        </p>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {withdrawal.bankName} - {withdrawal.accountNumber}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            a.n. {withdrawal.accountHolderName}
                        </p>
                        <div
                            className="pt-3 border-t mt-3 flex justify-between text-sm"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <span>Nominal Transfer (Net):</span>
                            <span
                                className="font-bold"
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                {formatCurrency(withdrawal.netAmount)}
                            </span>
                        </div>
                    </Card>

                    <FileInput
                        label="Bukti Transfer"
                        disabled={isLoading}
                        files={proof ? [proof] : []}
                        onFileSelect={(files) => setProof(files[0] ?? null)}
                        onFileRemove={() => setProof(null)}
                        accept=".jpg,.jpeg,.png,.pdf"
                        allowedFileTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
                        maxFileSize={5 * 1024 * 1024}
                        placeholder="Klik atau drag bukti transfer"
                        dropzoneText="Lepas bukti transfer di sini"
                        browseText="Pilih Berkas"
                        hint="Opsional. Format JPG, PNG, atau PDF dengan ukuran maksimal 5MB."
                        leftIcon={<FileText className="w-5 h-5" />}
                    />

                    {proof && (
                        <Alert
                            variant="success"
                            title="Bukti Transfer Dipilih"
                            description={`${proof.name} (${(proof.size / 1024 / 1024).toFixed(2)} MB)`}
                            icon={<CheckCircle2 className="w-5 h-5" />}
                        />
                    )}

                    <TextAreaInput
                        label="Catatan Transfer"
                        disabled={isLoading}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Catatan nomor referensi transfer atau info lainnya..."
                        rows={3}
                        minRows={3}
                        maxRows={6}
                        autoResize
                        optional
                    />
                </ModalBody>
                <ModalFooter justify="end" className="gap-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        loading={isLoading}
                        leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
                    >
                        Tandai Selesai & Paid
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};
