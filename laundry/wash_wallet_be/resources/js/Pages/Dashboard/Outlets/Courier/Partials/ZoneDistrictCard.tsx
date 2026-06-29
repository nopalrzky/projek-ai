import { Card } from "@/Components/Card";
import { NumberInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Trash2 } from "lucide-react";

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
    dn: DistrictNode;
    onUpdateDistrictFee: (districtId: string, fee: number) => void;
    onUpdateVillageFee: (districtId: string, villageId: string, fee: number | null) => void;
    onRemoveDistrict: (districtId: string) => void;
    onRemoveVillage: (districtId: string, villageId: string) => void;
}

const ZoneDistrictCard = ({
    dn,
    onUpdateDistrictFee,
    onUpdateVillageFee,
    onRemoveDistrict,
    onRemoveVillage
}: Props) => {
    return (
        <Card className="border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 bg-surface-muted/30 border-b border-border flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary uppercase tracking-tight">
                        {dn.districtName}
                    </p>
                    <p className="text-[10px] text-text-tertiary font-medium">
                        HARGA KECAMATAN
                    </p>
                </div>
                <div className="w-36">
                    <NumberInput
                        className="h-8 text-sm"
                        prefix="Rp "
                        thousandSeparator=","
                        value={dn.fee}
                        onValueChange={(val) =>
                            onUpdateDistrictFee(dn.districtId, val || 0)
                        }
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-error-500 hover:text-error-600 hover:bg-error-50"
                    onClick={() => onRemoveDistrict(dn.districtId)}
                    title="Hapus Kecamatan"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {dn.villages.length > 0 && (
                <div className="p-3 bg-surface space-y-2">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">
                        Kelurahan Spesifik
                    </p>
                    {dn.villages.map((v) => (
                        <div
                            key={`active-v-${v.villageId}`}
                            className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-primary-300 transition-colors bg-surface-muted/10"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-secondary truncate">
                                    {v.villageName}
                                </p>
                            </div>
                            <div className="w-32">
                                <NumberInput
                                    className="h-7 text-xs"
                                    prefix="Rp "
                                    thousandSeparator=","
                                    value={v.fee}
                                    onValueChange={(val) =>
                                        onUpdateVillageFee(
                                            dn.districtId,
                                            v.villageId,
                                            val || 0
                                        )
                                    }
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-error-400 hover:text-error-600 hover:bg-error-50"
                                onClick={() =>
                                    onRemoveVillage(dn.districtId, v.villageId)
                                }
                                title="Hapus Kelurahan"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ZoneDistrictCard;
