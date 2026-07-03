import { useState, useEffect, useMemo } from "react";
import { Card } from "@/Components/Card";
import { Input } from "@/Components/Input";
import { Search, Loader2 } from "lucide-react";
import axios from "axios";
import ZoneDistrictItem from "./ZoneDistrictItem";
import ZoneActivePanel from "./ZoneActivePanel";
import { useLatestAsync } from "@/Hooks/useLatestAsync";

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

const ZoneEditor = ({
    outletId,
    zones,
    onChange,
}: {
    outletId: number;
    zones: any[];
    onChange: (zones: any[]) => void;
}) => {
    const [districts, setDistricts] = useState<District[]>([]);
    const [villagesMap, setVillagesMap] = useState<Record<string, Village[]>>(
        {},
    );
    const [loadingVillages, setLoadingVillages] = useState<
        Record<string, boolean>
    >({});
    const [districtNodes, setDistrictNodes] = useState<DistrictNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
        new Set(),
    );

    const { runLatest: runLatestDistricts } = useLatestAsync();

    useEffect(() => {
        setIsLoading(true);
        setDistricts([]);
        
        runLatestDistricts(
            outletId,
            async () => await axios.get(
                route("outlets.courier-settings.zone-options", outletId),
            ),
            {
                onSuccess: (response) => {
                    setDistricts(response.data.districts || []);
                },
                onError: (error) => {
                    console.error("Failed to fetch zone options", error);
                },
                onFinally: () => {
                    setIsLoading(false);
                }
            }
        );
    }, [outletId, runLatestDistricts]);

    useEffect(() => {
        if (isLoading) return;

        const districtMap = new Map<string, DistrictNode>();

        zones
            .filter((z) => z.locationType === "district")
            .forEach((z) => {
                districtMap.set(z.locationId.toString(), {
                    districtId: z.locationId.toString(),
                    districtName: z.locationName,
                    fee: z.fee,
                    zoneId: z.id,
                    isExpanded: false,
                    villages: [],
                });
            });

        zones
            .filter((z) => z.locationType === "village")
            .forEach((z) => {
                const parentId = z.parentDistrictId?.toString();
                if (parentId && districtMap.has(parentId)) {
                    districtMap.get(parentId)!.villages.push({
                        villageId: z.locationId.toString(),
                        villageName: z.locationName,
                        fee: z.fee,
                        zoneId: z.id,
                    });
                }
            });

        setDistrictNodes((prev) => {
            const newNodes = Array.from(districtMap.values());
            return newNodes.map((nn) => {
                const existing = prev.find(
                    (p) => p.districtId === nn.districtId,
                );
                return existing
                    ? { ...nn, isExpanded: existing.isExpanded }
                    : nn;
            });
        });
    }, [zones, isLoading]);

    const notifyChanges = (newNodes: DistrictNode[]) => {
        const flatZones: any[] = newNodes.flatMap((dn) => {
            const result: any[] = [
                {
                    id: dn.zoneId,
                    locationType: "district",
                    locationId: dn.districtId,
                    locationName: dn.districtName,
                    fee: dn.fee,
                    sortOrder: 0,
                },
            ];

            dn.villages
                .filter((v) => v.fee !== null)
                .forEach((v) => {
                    result.push({
                        id: v.zoneId,
                        locationType: "village",
                        locationId: v.villageId,
                        locationName: v.villageName,
                        parentDistrictId: dn.districtId,
                        fee: v.fee!,
                        sortOrder: 0,
                    });
                });

            return result;
        });

        onChange(flatZones);
    };

    const fetchVillages = async (districtId: string) => {
        if (villagesMap[districtId] || loadingVillages[districtId]) return;

        setLoadingVillages((prev) => ({ ...prev, [districtId]: true }));
        try {
            const { data } = await axios.get(
                route("outlets.courier-settings.zone-village-options", {
                    outletId,
                    districtId,
                }),
            );
            setVillagesMap((prev) => ({ ...prev, [districtId]: data || [] }));
        } catch (error) {
            console.error("Failed to fetch villages", error);
        } finally {
            setLoadingVillages((prev) => ({ ...prev, [districtId]: false }));
        }
    };

    const toggleDistrictExpand = (districtId: string) => {
        setExpandedDistricts((prev) => {
            const next = new Set(prev);
            if (next.has(districtId)) {
                next.delete(districtId);
            } else {
                next.add(districtId);
                fetchVillages(districtId);
            }
            return next;
        });
    };

    const addDistrict = (districtId: string, districtName: string) => {
        if (districtNodes.some((dn) => dn.districtId === districtId)) return;

        const newNode: DistrictNode = {
            districtId,
            districtName,
            fee: 0,
            zoneId: null,
            isExpanded: true,
            villages: [],
        };

        const nextNodes = [...districtNodes, newNode];
        setDistrictNodes(nextNodes);
        notifyChanges(nextNodes);
    };

    const addVillage = (
        districtId: string,
        districtName: string,
        villageId: string,
        villageName: string,
    ) => {
        let nodeIndex = districtNodes.findIndex(
            (dn) => dn.districtId === districtId,
        );
        let nextNodes = [...districtNodes];

        if (nodeIndex === -1) {
            nextNodes.push({
                districtId,
                districtName,
                fee: 0,
                zoneId: null,
                isExpanded: true,
                villages: [],
            });
            nodeIndex = nextNodes.length - 1;
        }

        const node = nextNodes[nodeIndex];
        if (!node.villages.some((v) => v.villageId === villageId)) {
            nextNodes[nodeIndex] = {
                ...node,
                isExpanded: true,
                villages: [
                    ...node.villages,
                    {
                        villageId,
                        villageName,
                        fee: node.fee,
                        zoneId: null,
                    },
                ],
            };
            setDistrictNodes(nextNodes);
            notifyChanges(nextNodes);
        }
    };

    const removeDistrict = (districtId: string) => {
        const nextNodes = districtNodes.filter(
            (dn) => dn.districtId !== districtId,
        );
        setDistrictNodes(nextNodes);
        notifyChanges(nextNodes);
    };

    const removeVillage = (districtId: string, villageId: string) => {
        const nextNodes = districtNodes.map((dn) => {
            if (dn.districtId === districtId) {
                return {
                    ...dn,
                    villages: dn.villages.filter(
                        (v) => v.villageId !== villageId,
                    ),
                };
            }
            return dn;
        });
        setDistrictNodes(nextNodes);
        notifyChanges(nextNodes);
    };

    const updateDistrictFee = (districtId: string, fee: number) => {
        const nextNodes = districtNodes.map((dn) =>
            dn.districtId === districtId ? { ...dn, fee } : dn,
        );
        setDistrictNodes(nextNodes);
        notifyChanges(nextNodes);
    };

    const updateVillageFee = (
        districtId: string,
        villageId: string,
        fee: number | null,
    ) => {
        const nextNodes = districtNodes.map((dn) => {
            if (dn.districtId === districtId) {
                return {
                    ...dn,
                    villages: dn.villages.map((v) =>
                        v.villageId === villageId ? { ...v, fee } : v,
                    ),
                };
            }
            return dn;
        });
        setDistrictNodes(nextNodes);
        notifyChanges(nextNodes);
    };

    const filteredOptions = useMemo(() => {
        if (!search) return districts;
        const q = search.toLowerCase();

        return districts.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                (villagesMap[d.id.toString()] &&
                    villagesMap[d.id.toString()].some((v) =>
                        v.name.toLowerCase().includes(q),
                    )),
        );
    }, [districts, search, villagesMap]);

    return (
        <Card className="p-0 overflow-hidden border-border flex flex-col">
            <div className="p-6 border-b border-border bg-surface">
                <h3 className="text-lg font-medium text-text-primary">
                    Pengaturan Zona (Kecamatan & Kelurahan)
                </h3>
                <p className="text-sm text-text-secondary">
                    Tentukan biaya per kecamatan. Anda juga bisa mengatur biaya
                    spesifik per kelurahan/desa.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border bg-surface">
                <div className="flex flex-col h-[480px]">
                    <div className="p-4 border-b border-border bg-surface-muted/50">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-text-tertiary" />
                            <Input
                                placeholder="Cari kecamatan atau kelurahan..."
                                className="pl-10 bg-surface"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-surface-muted/10">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary-300" />
                                <p className="text-sm font-medium text-text-secondary">
                                    Memuat wilayah...
                                </p>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="text-center py-8 text-sm text-text-tertiary">
                                Wilayah tidak ditemukan.
                            </div>
                        ) : (
                            filteredOptions.map((dist) => {
                                const activeDistrict = districtNodes.find(
                                    (dn) =>
                                        dn.districtId === dist.id.toString(),
                                );
                                const isDistAdded = !!activeDistrict;
                                const isExpanded = expandedDistricts.has(
                                    dist.id.toString(),
                                );

                                return (
                                    <ZoneDistrictItem
                                        key={`d-${dist.id}`}
                                        district={dist}
                                        isExpanded={isExpanded}
                                        isAdded={isDistAdded}
                                        villages={
                                            villagesMap[dist.id.toString()] ||
                                            []
                                        }
                                        isLoadingVillages={
                                            loadingVillages[
                                                dist.id.toString()
                                            ] || false
                                        }
                                        activeDistrict={activeDistrict}
                                        onToggle={() =>
                                            toggleDistrictExpand(
                                                dist.id.toString(),
                                            )
                                        }
                                        onAddDistrict={() =>
                                            addDistrict(
                                                dist.id.toString(),
                                                dist.name,
                                            )
                                        }
                                        onAddVillage={(vil) =>
                                            addVillage(
                                                dist.id.toString(),
                                                dist.name,
                                                vil.id.toString(),
                                                vil.name,
                                            )
                                        }
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                <ZoneActivePanel
                    districtNodes={districtNodes}
                    onUpdateDistrictFee={updateDistrictFee}
                    onUpdateVillageFee={updateVillageFee}
                    onRemoveDistrict={removeDistrict}
                    onRemoveVillage={removeVillage}
                />
            </div>
        </Card>
    );
};

export default ZoneEditor;
