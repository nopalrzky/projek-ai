import type { ReactNode } from "react";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Briefcase,
    ChevronRight,
    Mail,
    MapPin,
    Phone,
    Store,
    User,
    Users,
} from "lucide-react";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

const InfoLine = ({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label?: string;
    children: ReactNode;
}) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--color-text-tertiary)]">{icon}</span>
        <div className="min-w-0">
            {label && (
                <p className="mb-0.5 text-xs text-[var(--color-text-secondary)]">
                    {label}
                </p>
            )}
            <div className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                {children}
            </div>
        </div>
    </div>
);

export default function OverviewParties({ order, onNavigateTab }: Props) {
    const customer = order.customer;
    const employee = order.employee;
    const outlet = order.outlet || order.employee?.outlet;
    const employeePosition = employee?.employeePositions?.[0]?.position?.name;
    const outletAddress = outlet?.fullAddress || outlet?.street;

    return (
        <Card className="h-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                        <Users className="h-4 w-4 text-[var(--color-primary-600)]" />
                        Pihak Terkait
                    </span>
                    <Badge variant="secondary" size="sm">
                        Owner View
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="flex h-full flex-col p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                Pelanggan
                            </h4>
                            {customer && (
                                <Badge variant="primary" size="xs">
                                    Customer
                                </Badge>
                            )}
                        </div>

                        {customer ? (
                            <div className="flex-1 space-y-4">
                                <InfoLine icon={<User className="h-4 w-4" />}>
                                    <span className="font-semibold">
                                        {customer.name}
                                    </span>
                                </InfoLine>

                                {customer.phone ? (
                                    <InfoLine
                                        icon={<Phone className="h-4 w-4" />}
                                        label="Telepon"
                                    >
                                        <a
                                            href={`tel:${customer.phone}`}
                                            className="font-semibold text-[var(--color-primary-600)] hover:underline"
                                        >
                                            {customer.phone}
                                        </a>
                                    </InfoLine>
                                ) : (
                                    <InfoLine
                                        icon={<Phone className="h-4 w-4" />}
                                        label="Telepon"
                                    >
                                        <Badge variant="warning" size="xs">
                                            Belum tersedia
                                        </Badge>
                                    </InfoLine>
                                )}

                                {customer.email && (
                                    <InfoLine
                                        icon={<Mail className="h-4 w-4" />}
                                        label="Email"
                                    >
                                        <a
                                            href={`mailto:${customer.email}`}
                                            className="break-all text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                                        >
                                            {customer.email}
                                        </a>
                                    </InfoLine>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
                                Data pelanggan tidak tersedia.
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            className="mt-5 justify-between text-xs text-[var(--color-primary-600)]"
                            size="sm"
                            fullWidth
                            onClick={() => onNavigateTab(4)}
                            rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                        >
                            Detail Pelanggan
                        </Button>
                    </div>

                    <div className="flex h-full flex-col p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                Operasional
                            </h4>
                            {outlet && (
                                <Badge variant="secondary" size="xs">
                                    Outlet
                                </Badge>
                            )}
                        </div>

                        <div className="flex-1 space-y-5">
                            {employee ? (
                                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                                    <InfoLine
                                        icon={<User className="h-4 w-4" />}
                                        label="Penanggung Jawab"
                                    >
                                        <span className="font-semibold">
                                            {employee.name}
                                        </span>
                                    </InfoLine>
                                    {employeePosition && (
                                        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                                            <InfoLine
                                                icon={
                                                    <Briefcase className="h-4 w-4" />
                                                }
                                                label="Posisi"
                                            >
                                                <span className="text-[var(--color-text-secondary)]">
                                                    {employeePosition}
                                                </span>
                                            </InfoLine>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
                                    Data karyawan tidak tersedia.
                                </div>
                            )}

                            {outlet ? (
                                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                                    <InfoLine
                                        icon={<Store className="h-4 w-4" />}
                                        label="Outlet"
                                    >
                                        <span className="font-semibold">
                                            {outlet.name}
                                        </span>
                                    </InfoLine>
                                    {outletAddress && (
                                        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                                            <InfoLine
                                                icon={
                                                    <MapPin className="h-4 w-4" />
                                                }
                                                label="Alamat"
                                            >
                                                <span className="line-clamp-2 text-[var(--color-text-secondary)]">
                                                    {outletAddress}
                                                </span>
                                            </InfoLine>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-text-secondary)]">
                                    Data outlet tidak tersedia.
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className="mt-5 justify-between text-xs text-[var(--color-primary-600)]"
                            size="sm"
                            fullWidth
                            onClick={() => onNavigateTab(5)}
                            rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                        >
                            Detail Karyawan
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
