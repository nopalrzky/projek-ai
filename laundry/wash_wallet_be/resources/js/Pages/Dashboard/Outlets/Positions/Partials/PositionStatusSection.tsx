import React from "react";
import CheckboxInput from "@/Components/Input/Checkbox";
import { Alert } from "@/Components/Alert";

interface Props {
    isActive: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

const PositionStatusSection: React.FC<Props> = ({ isActive, onChange, disabled = false }) => {
    return (
        <div className="space-y-3">
            <CheckboxInput
                label="Status Aktif"
                description={isActive ? "Posisi aktif dan dapat ditugaskan ke karyawan" : "Posisi dinonaktifkan dan tidak dapat ditugaskan"}
                checked={!!isActive}
                onChange={(v) => onChange(Boolean(v))}
                variant="switch"
                disabled={disabled}
            />

            {!isActive && (
                <Alert variant="warning" title="Posisi Nonaktif" description="Posisi yang dinonaktifkan tidak akan memberikan permission kepada karyawan yang memilikinya." />
            )}
        </div>
    );
};

export default PositionStatusSection;
