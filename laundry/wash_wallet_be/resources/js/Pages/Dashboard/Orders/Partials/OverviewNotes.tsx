import type { ReactNode } from "react";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ClipboardList, FileText, LockKeyhole, StickyNote } from "lucide-react";

interface Props {
    order: Order;
}

const NoteBlock = ({
    icon,
    label,
    children,
    tone = "default",
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
    tone?: "default" | "warning";
}) => {
    const classes =
        tone === "warning"
            ? "border-[var(--color-warning-200)] bg-[var(--color-warning-50)] text-[var(--color-warning-900)]"
            : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]";

    const headingClasses =
        tone === "warning"
            ? "text-[var(--color-warning-700)]"
            : "text-[var(--color-text-secondary)]";

    return (
        <div className={`rounded-[var(--radius-lg)] border p-4 ${classes}`}>
            <h4
                className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${headingClasses}`}
            >
                {icon}
                {label}
            </h4>
            {children}
        </div>
    );
};

export default function OverviewNotes({ order }: Props) {
    const hasSpecialInstructions =
        Array.isArray(order.specialInstructions) &&
        order.specialInstructions.length > 0;
    const hasInternalNotes = Boolean(order.internalNotes);
    const hasCustomerNotes = Boolean(order.notes);

    if (!hasSpecialInstructions && !hasInternalNotes && !hasCustomerNotes) {
        return null;
    }

    return (
        <Card className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-[var(--color-text-primary)]">
                    <StickyNote className="h-4 w-4 text-[var(--color-primary-600)]" />
                    Catatan & Instruksi
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
                {hasSpecialInstructions && (
                    <NoteBlock
                        icon={<ClipboardList className="h-3.5 w-3.5" />}
                        label="Instruksi Khusus"
                    >
                        <div className="flex flex-wrap gap-2">
                            {order.specialInstructions!.map(
                                (instruction, idx) => (
                                    <Badge
                                        key={`${instruction}-${idx}`}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        {instruction}
                                    </Badge>
                                ),
                            )}
                        </div>
                    </NoteBlock>
                )}

                {hasCustomerNotes && (
                    <NoteBlock
                        icon={<FileText className="h-3.5 w-3.5" />}
                        label="Catatan Pelanggan"
                    >
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {order.notes}
                        </p>
                    </NoteBlock>
                )}

                {hasInternalNotes && (
                    <NoteBlock
                        icon={<LockKeyhole className="h-3.5 w-3.5" />}
                        label="Catatan Internal"
                        tone="warning"
                    >
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {order.internalNotes}
                        </p>
                    </NoteBlock>
                )}
            </CardContent>
        </Card>
    );
}
