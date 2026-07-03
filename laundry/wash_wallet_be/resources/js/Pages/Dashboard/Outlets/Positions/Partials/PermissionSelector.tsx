import React from "react";
import CheckboxInput from "@/Components/Input/Checkbox";
import { Badge } from "@/Components/Badge";
import { ShieldCheck } from "lucide-react";
import { PermissionCatalogGroup } from "@/types/permission";

interface Props {
    catalog: PermissionCatalogGroup[];
    selected: string[];
    onChange: (permissions: string[]) => void;
    disabled?: boolean;
    errors?: Record<string, any>;
}

const PermissionSelector: React.FC<Props> = ({ catalog, selected, onChange, disabled = false, errors }) => {
    const toggle = (key: string) => {
        const next = selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key];
        onChange(next);
    };

    const allPermissionsCount = catalog.reduce((acc, group) => acc + group.permissions.length, 0);
    const selectAll = () => onChange(catalog.flatMap(g => g.permissions.map(p => p.key)));
    const reset = () => onChange([]);

    const toggleGroup = (groupIndex: number) => {
        const items = catalog[groupIndex].permissions.map(i => i.key);
        const allSelected = items.every(k => selected.includes(k));
        if (allSelected) {
            onChange(selected.filter(k => !items.includes(k)));
        } else {
            const nextSet = new Set(selected);
            items.forEach(k => nextSet.add(k));
            onChange(Array.from(nextSet));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--color-primary-100)" }}>
                        <ShieldCheck className="w-5 h-5" style={{ color: "var(--color-primary-600)" }} />
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Hak Akses (Permissions)</h3>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Pilih permission yang melekat pada posisi ini</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="permissions_select_all_global"
                        checked={allPermissionsCount > 0 && selected.length === allPermissionsCount}
                        onChange={(e) => (e.target.checked ? selectAll() : reset())}
                        disabled={disabled}
                        className="w-4 h-4 mr-2"
                    />
                    <label htmlFor="permissions_select_all_global" className="text-sm mr-3" style={{ color: 'var(--color-text-primary)' }}>Pilih Semua</label>
                    <Badge.Count count={selected.length} />
                    <Badge className="text-sm" variant="ghost" size="sm">{`${selected.length} / ${allPermissionsCount} dipilih`}</Badge>
                    <button type="button" className="text-sm text-[var(--color-text-secondary)]" onClick={reset} disabled={disabled}>Reset</button>
                </div>
            </div>

            <div className="space-y-4">
                {catalog.map((groupData, index) => (
                    <div key={groupData.group} className="p-3 rounded-md border" style={{ borderColor: "var(--color-border)", backgroundColor: undefined }}>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{groupData.group}</h4>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={groupData.permissions.every(i => selected.includes(i.key))}
                                    onChange={() => toggleGroup(index)}
                                    disabled={disabled}
                                    className="w-4 h-4"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {groupData.permissions.map(item => (
                                <div key={item.key} className="p-2 rounded-md" style={{ backgroundColor: selected.includes(item.key) ? "var(--color-primary-100)" : undefined }}>
                                    <CheckboxInput
                                        label={item.label}
                                        checked={selected.includes(item.key)}
                                        onChange={() => toggle(item.key)}
                                        disabled={disabled}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {(() => {
                let displayedError: string | undefined;

                if (errors) {
                    if (typeof errors.permissions === 'string') {
                        displayedError = errors.permissions;
                    } else if (Array.isArray(errors.permissions)) {
                        displayedError = errors.permissions.join(', ');
                    } else {
                        const parts = Object.keys(errors)
                            .filter(k => k === 'permissions' || k.startsWith('permissions.'))
                            .map(k => errors[k])
                            .flat()
                            .filter(Boolean);

                        if (parts.length) displayedError = parts.join(', ');
                    }
                }

                return displayedError ? (
                    <p className="text-sm text-[var(--color-error-500)]">{displayedError}</p>
                ) : null;
            })()}
        </div>
    );
};

export default PermissionSelector;
