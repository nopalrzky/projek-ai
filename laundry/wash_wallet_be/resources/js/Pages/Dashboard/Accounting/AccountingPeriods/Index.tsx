import { useCallback, useMemo, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Calendar,
    Lock,
    Unlock,
    Plus,
    Trash2,
    AlertCircle,
    Clock,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Modal } from "@/Components/Modal";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AccountingPeriod {
    id: number;
    outlet_id: number;
    start_date: string;
    end_date: string;
    is_closed: boolean;
    closed_at: string | null;
    closed_by: number | null;
}

interface IndexProps {
    periods: AccountingPeriod[];
    outlets: { id: number; name: string; code: string }[];
    filters: {
        outletId: number | null;
        isClosed: boolean | null;
        search: string;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

function AccountingPeriodsIndex({
    periods,
    outlets,
    filters,
    flash,
}: IndexProps) {
    const [createModal, setCreateModal] = useState<{ show: boolean }>({
        show: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        outlet_id: filters.outletId || "",
        start_date: "",
        end_date: "",
    });

    const handleFilterChange = useCallback(
        (field: string, value: unknown) => {
            router.get(
                route("accounting-periods.index"),
                { ...filters, [field]: value },
                { preserveState: true, preserveScroll: true },
            );
        },
        [filters],
    );

    const handleCreatePeriod = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            post(route("accounting-periods.store"), {
                onSuccess: () => {
                    setCreateModal({ show: false });
                    reset();
                },
            });
        },
        [post, reset],
    );

    const handleClosePeriod = useCallback((id: number) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menutup periode ini? Setelah ditutup, transaksi tidak dapat diinput ke periode ini.",
            )
        ) {
            router.post(route("accounting-periods.close", id));
        }
    }, []);

    const handleReopenPeriod = useCallback((id: number) => {
        if (confirm("Buka kembali periode ini?")) {
            router.post(route("accounting-periods.reopen", id));
        }
    }, []);

    const handleDeletePeriod = useCallback((id: number) => {
        if (
            confirm(
                "Hapus periode ini? Hanya periode yang belum ditutup dan tidak memiliki transaksi yang bisa dihapus.",
            )
        ) {
            router.delete(route("accounting-periods.destroy", id));
        }
    }, []);

    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), "dd MMMM yyyy", { locale: idLocale });
    };

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih Outlet..." },
            ...outlets.map((o) => ({
                value: o.id.toString(),
                label: o.name,
            })),
        ],
        [outlets],
    );

    const statusOptions = useMemo(
        () => [
            { value: "", label: "Semua Status" },
            { value: "false", label: "Terbuka" },
            { value: "true", label: "Tertutup" },
        ],
        [],
    );

    return (
        <>
            <Head title="Periode Akuntansi" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Periode Akuntansi"
                        subtitle="Kelola periode tutup buku untuk memastikan integritas laporan keuangan"
                        icon={Calendar}
                        variant="default"
                        actions={
                            <Button
                                variant="primary"
                                onClick={() => setCreateModal({ show: true })}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Buat Periode Baru
                            </Button>
                        }
                    />

                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={flash.success}
                        />
                    )}
                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <Card className="card p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <SelectInput
                                    label="Outlet"
                                    value={filters.outletId || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "outletId",
                                            e.target.value,
                                        )
                                    }
                                    options={outletOptions}
                                />
                            </div>
                            <div className="flex-1">
                                <SelectInput
                                    label="Status"
                                    value={
                                        filters.isClosed === null
                                            ? ""
                                            : filters.isClosed.toString()
                                    }
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "isClosed",
                                            e.target.value === ""
                                                ? null
                                                : e.target.value === "true",
                                        )
                                    }
                                    options={statusOptions}
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        {periods.length > 0 ? (
                            periods.map((period) => (
                                <Card
                                    key={period.id}
                                    className="card p-5 overflow-hidden relative border-l-4 bg-surface"
                                    style={{
                                        borderLeftColor: period.is_closed
                                            ? "var(--color-error-500)"
                                            : "var(--color-success-500)",
                                    }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 rounded-xl border ${period.is_closed ? "bg-error-50 text-error-600 border-error-100" : "bg-success-50 text-success-600 border-success-100"}`}
                                                style={{
                                                    backgroundColor:
                                                        period.is_closed
                                                            ? "var(--color-error-50)"
                                                            : "var(--color-success-50)",
                                                    color: period.is_closed
                                                        ? "var(--color-error-600)"
                                                        : "var(--color-success-600)",
                                                }}
                                            >
                                                {period.is_closed ? (
                                                    <Lock className="w-6 h-6" />
                                                ) : (
                                                    <Unlock className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-primary">
                                                        {format(
                                                            new Date(
                                                                period.start_date,
                                                            ),
                                                            "MMMM yyyy",
                                                            {
                                                                locale: idLocale,
                                                            },
                                                        )}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            period.is_closed
                                                                ? "error"
                                                                : "success"
                                                        }
                                                    >
                                                        {period.is_closed
                                                            ? "Tertutup"
                                                            : "Terbuka"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-secondary">
                                                    {formatDate(
                                                        period.start_date,
                                                    )}{" "}
                                                    -{" "}
                                                    {formatDate(
                                                        period.end_date,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {period.is_closed ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleReopenPeriod(
                                                            period.id,
                                                        )
                                                    }
                                                    leftIcon={
                                                        <Unlock className="w-4 h-4" />
                                                    }
                                                >
                                                    Buka Kembali
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleClosePeriod(
                                                            period.id,
                                                        )
                                                    }
                                                    leftIcon={
                                                        <Lock className="w-4 h-4" />
                                                    }
                                                >
                                                    Tutup Buku
                                                </Button>
                                            )}
                                            {!period.is_closed && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeletePeriod(
                                                            period.id,
                                                        )
                                                    }
                                                    className="text-error-600 hover:bg-error-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {period.is_closed && period.closed_at && (
                                        <div className="mt-4 flex items-center gap-2 border-t border-color pt-4 text-xs text-tertiary">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                Ditutup pada{" "}
                                                {format(
                                                    new Date(period.closed_at),
                                                    "dd MMM yyyy HH:mm",
                                                    { locale: idLocale },
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <Card className="card p-12 text-center bg-surface">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <Calendar className="w-16 h-16 mb-4" />
                                    <p className="text-lg font-medium">
                                        Belum ada periode akuntansi
                                    </p>
                                    <p className="text-sm">
                                        Pilih outlet atau buat periode baru
                                        untuk memulai.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Create Modal */}
            <Modal
                isOpen={createModal.show}
                onClose={() => setCreateModal({ show: false })}
                title="Buat Periode Akuntansi Baru"
            >
                <form onSubmit={handleCreatePeriod} className="space-y-4 pt-4">
                    <SelectInput
                        label="Outlet"
                        value={data.outlet_id}
                        onChange={(e) => setData("outlet_id", e.target.value)}
                        options={outlets.map((o) => ({
                            value: o.id.toString(),
                            label: o.name,
                        }))}
                        error={errors.outlet_id}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <DateInput
                            label="Tanggal Mulai"
                            value={data.start_date}
                            onChange={(e) =>
                                setData("start_date", e.target.value)
                            }
                            error={errors.start_date}
                            required
                        />
                        <DateInput
                            label="Tanggal Selesai"
                            value={data.end_date}
                            onChange={(e) =>
                                setData("end_date", e.target.value)
                            }
                            error={errors.end_date}
                            required
                        />
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
                        <AlertCircle className="mt-0.5 w-5 h-5 text-amber-600" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold">Perhatian</p>
                            <p>
                                Pastikan tanggal periode tidak tumpang tindih
                                dengan periode yang sudah ada.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setCreateModal({ show: false })}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? "Memproses..." : "Buat Periode"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

AccountingPeriodsIndex.layout = withAuthenticatedLayout({
    title: "Periode Akuntansi",
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Periode Akuntansi", href: route("accounting-periods.index") },
    ],
});

export default AccountingPeriodsIndex;
