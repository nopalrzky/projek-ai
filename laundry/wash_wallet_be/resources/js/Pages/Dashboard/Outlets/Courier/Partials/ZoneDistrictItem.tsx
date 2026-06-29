import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { ChevronDown, ChevronRight, Plus, Check, Loader2 } from "lucide-react";

interface Village {
    id: number;
    name: string;
    type: string;
}

interface District {
    id: number;
    name: string;
    type: string;
}

interface VillageNode {
    villageId: string;
    villageName: string;
    fee: number | null;
    zoneId: number | null;
}

interface DistrictNode {
    districtId: string;
    districtName: string;
    fee: number;
    zoneId: number | null;
    isExpanded: boolean;
    villages: VillageNode[];
}

interface Props {
    district: District;
    isExpanded: boolean;
    isAdded: boolean;
    villages: Village[];
    isLoadingVillages: boolean;
    activeDistrict?: DistrictNode;
    onToggle: () => void;
    onAddDistrict: () => void;
    onAddVillage: (village: Village) => void;
}

const ZoneDistrictItem = ({
    district,
    isExpanded,
    isAdded,
    villages,
    isLoadingVillages,
    activeDistrict,
    onToggle,
    onAddDistrict,
    onAddVillage,
}: Props) => {
    return (
        <div className="border border-border rounded-xl overflow-hidden bg-surface shadow-sm">
            <div className="p-3 flex items-center justify-between hover:bg-surface-muted transition-colors">
                <div
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={onToggle}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text-primary uppercase tracking-tight">
                            {district.name}
                        </span>
                        {isAdded && (
                            <Badge
                                variant="success"
                                size="xs"
                                className="px-1.5 py-0"
                            >
                                Zona Aktif
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAdded && activeDistrict && (
                        <span className="text-xs font-medium text-text-tertiary">
                            Rp {activeDistrict.fee.toLocaleString("id-ID")}
                        </span>
                    )}
                    {!isAdded && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-primary hover:bg-primary-50"
                            onClick={onAddDistrict}
                            title="Tambahkan Kecamatan sebagai Zona"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="bg-surface-muted/30 border-t border-border p-2 space-y-1">
                    {isLoadingVillages ? (
                        <div className="flex items-center justify-center py-4 text-text-tertiary">
                            <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary-300" />
                            <span className="text-xs">Memuat kelurahan...</span>
                        </div>
                    ) : villages.length === 0 ? (
                        <div className="text-center py-2 text-xs text-text-tertiary">
                            Tidak ada kelurahan.
                        </div>
                    ) : (
                        villages.map((vil) => {
                            const activeVillage = activeDistrict?.villages.find(
                                (v) => v.villageId === vil.id.toString(),
                            );
                            const isVilAdded = !!activeVillage;

                            return (
                                <div
                                    key={`v-${vil.id}`}
                                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface transition-colors"
                                >
                                    <div className="flex items-center gap-2 pl-6">
                                        <span className="text-sm text-text-secondary">
                                            {vil.name}
                                        </span>
                                        {isVilAdded && (
                                            <Check className="w-3.5 h-3.5 text-success-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isVilAdded && (
                                            <span className="text-xs font-medium text-text-tertiary">
                                                Rp{" "}
                                                {(
                                                    activeVillage.fee ??
                                                    activeDistrict?.fee ??
                                                    0
                                                ).toLocaleString("id-ID")}
                                            </span>
                                        )}
                                        {!isVilAdded && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    onAddVillage(vil)
                                                }
                                                title="Tambahkan Kelurahan sebagai Zona"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default ZoneDistrictItem;
