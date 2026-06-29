import { Badge } from "@/Components/Badge";
import { MapPin } from "lucide-react";
import ZoneDistrictCard from "./ZoneDistrictCard";

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
    districtNodes: DistrictNode[];
    onUpdateDistrictFee: (districtId: string, fee: number) => void;
    onUpdateVillageFee: (districtId: string, villageId: string, fee: number | null) => void;
    onRemoveDistrict: (districtId: string) => void;
    onRemoveVillage: (districtId: string, villageId: string) => void;
}

const ZoneActivePanel = ({
    districtNodes,
    onUpdateDistrictFee,
    onUpdateVillageFee,
    onRemoveDistrict,
    onRemoveVillage
}: Props) => {
    return (
        <div className="flex flex-col h-[480px] bg-surface">
            <div className="p-4 border-b border-border bg-surface-muted/20 flex justify-between items-center">
                <span className="text-sm font-semibold text-text-primary">
                    Zona Aktif Dikonfigurasi
                </span>
                <Badge variant="secondary" size="sm">
                    {districtNodes.length} Kecamatan
                </Badge>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {districtNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-tertiary py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4 border border-border">
                            <MapPin className="w-8 h-8 text-border-hover" />
                        </div>
                        <p className="text-sm font-medium text-text-secondary mb-1">
                            Belum ada zona
                        </p>
                        <p className="text-xs">
                            Klik tombol + pada panel sebelah kiri untuk menambahkan
                            kecamatan atau kelurahan.
                        </p>
                    </div>
                ) : (
                    districtNodes.map((dn) => (
                        <ZoneDistrictCard
                            key={`active-${dn.districtId}`}
                            dn={dn}
                            onUpdateDistrictFee={onUpdateDistrictFee}
                            onUpdateVillageFee={onUpdateVillageFee}
                            onRemoveDistrict={onRemoveDistrict}
                            onRemoveVillage={onRemoveVillage}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ZoneActivePanel;
