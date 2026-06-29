import React from "react";
import { Link } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import Button from "@/Components/Button/Button";
import { Building2, ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { ProfileOutlet } from "../types";

interface OutletsTabProps {
    outlets: ProfileOutlet[];
}

const OutletsTab: React.FC<OutletsTabProps> = ({ outlets }) => {
    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: id,
            });
        } catch {
            return "-";
        }
    };

    if (outlets.length === 0) {
        return (
            <Card>
                <div className="p-12 text-center">
                    <Building2 className="w-12 h-12 text-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        Belum Ada Outlet
                    </h3>
                    <p className="text-secondary mb-6">
                        Anda belum memiliki outlet. Buat outlet pertama Anda
                        untuk memulai.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        href="/outlets/create"
                        leftIcon={<Building2 className="w-4 h-4" />}
                    >
                        Buat Outlet Baru
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                    Outlets Anda ({outlets.length})
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    href="/outlets/create"
                    leftIcon={<Building2 className="w-4 h-4" />}
                >
                    Buat Outlet Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {outlets.map((outlet) => (
                    <Card key={outlet.id}>
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-primary">
                                            {outlet.name}
                                        </h4>
                                        <Badge
                                            variant={
                                                outlet.isActive
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            size="sm"
                                        >
                                            {outlet.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-secondary mb-1">
                                        Kode: {outlet.code}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-tertiary">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Dibuat{" "}
                                            {formatDate(outlet.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <Link href={route("outlets.show", outlet.id)}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        rightIcon={
                                            <ExternalLink className="w-4 h-4" />
                                        }
                                    >
                                        Buka Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OutletsTab;
