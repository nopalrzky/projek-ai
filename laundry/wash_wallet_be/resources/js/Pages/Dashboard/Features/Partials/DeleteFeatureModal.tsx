import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Feature } from "@/types";
import { AlertTriangle } from "lucide-react";

interface DeleteFeatureModalProps {
    isOpen: boolean;
    feature?: Feature;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const DeleteFeatureModal = ({
    isOpen,
    feature,
    onClose,
    onConfirm,
    isLoading = false,
}: DeleteFeatureModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" variant="danger">
            <ModalHeader 
                icon={<AlertTriangle className="text-red-500" />}
                title="Hapus Fitur"
                onClose={onClose}
            />

            <ModalBody>
                <p className="text-sm text-muted-foreground">
                    Apakah Anda yakin ingin menghapus fitur{" "}
                    <span className="font-bold text-foreground">
                        {feature?.name}
                    </span>
                    ? Tindakan ini tidak dapat dibatalkan dan mungkin
                    mempengaruhi outlet yang sudah menggunakan fitur ini.
                </p>
            </ModalBody>

            <ModalFooter>
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Batal
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    loading={isLoading}
                >
                    Hapus Fitur
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default DeleteFeatureModal;
