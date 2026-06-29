import React from "react";
import { Button } from "@/Components/Button";

interface Props {
    processing: boolean;
    isValid: boolean;
    submitLabel: string;
    isDirty?: boolean;
    hasUnsavedChanges?: boolean;
    onCancel: () => void;
}

const PositionFormActions: React.FC<Props> = ({ processing, isValid, submitLabel, onCancel }) => {
    return (
        <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
            <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                Batal
            </Button>

            <Button type="submit" variant="primary" disabled={processing || !isValid} loading={processing} size="lg">
                {processing ? "Menyimpan..." : submitLabel}
            </Button>
        </div>
    );
};

export default PositionFormActions;
