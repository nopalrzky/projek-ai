import type { FormEvent } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    AlertCircle,
    ArrowLeft,
    FileText,
    Save,
    Wallet,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import payrollService from "@/Services/payroll.service";
import { PayrollEditProps } from "./types";

type PayrollEditForm = {
    _method: "put";
    status: "draft" | "paid";
    note: string;
    attachment: File | null;
};

const statusBadgeVariant = (
    status: "draft" | "paid" | "cancelled",
): "warning" | "success" | "error" => {
    if (status === "paid") return "success";
    if (status === "cancelled") return "error";
    return "warning";
};

function PayrollEdit({ payroll, flash }: PayrollEditProps) {
    const { data, setData, post, processing, errors } = useForm<PayrollEditForm>(
        {
            _method: "put",
            status: payroll.status === "paid" ? "paid" : "draft",
            note: payroll.note ?? "",
            attachment: null,
        },
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route("payrolls.update", payroll.id), {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Edit Payroll ${payroll.transactionNumber}`} />

            <div className="p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <PageHeader
                        title="Edit Payroll"
                        subtitle={payroll.transactionNumber}
                        icon={Wallet}
                        animate={true}
                        actions={
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={() =>
                                        payrollService.goToView(payroll.id)
                                    }
                                    variant="outline"
                                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                                >
                                    Kembali ke Detail
                                </Button>
                                <Button
                                    type="submit"
                                    form="payroll-edit-form"
                                    variant="primary"
                                    leftIcon={<Save className="h-4 w-4" />}
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </Button>
                            </div>
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

                    {flash?.warning && (
                        <Alert
                            variant="warning"
                            title="Perhatian"
                            description={flash.warning}
                        />
                    )}

                    <Alert
                        variant="warning"
                        title="Ruang Edit Payroll"
                        description="Halaman ini hanya memperbarui status, catatan, dan lampiran. Komponen perhitungan gaji tetap mengikuti hasil payroll yang sudah dibuat."
                    />

                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="p-5">
                            <p className="text-sm text-slate-500">Karyawan</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {payroll.employeeName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {payroll.employeeCode}
                            </p>
                        </Card>

                        <Card className="p-5">
                            <p className="text-sm text-slate-500">Outlet</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {payroll.outletName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {payroll.periodLabel}
                            </p>
                        </Card>

                        <Card className="p-5">
                            <p className="text-sm text-slate-500">
                                Gaji Bersih
                            </p>
                            <p className="mt-1 text-lg font-semibold text-emerald-700">
                                {payroll.formattedNetSalary ||
                                    formatCurrency(payroll.netSalary)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Tgl bayar: {payroll.formattedPaymentDate}
                            </p>
                        </Card>

                        <Card className="p-5">
                            <p className="text-sm text-slate-500">
                                Status Saat Ini
                            </p>
                            <div className="mt-2">
                                <Badge
                                    variant={statusBadgeVariant(payroll.status)}
                                    size="sm"
                                >
                                    {payroll.statusLabel}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Metode: {payroll.paymentMethodLabel}
                            </p>
                        </Card>
                    </div>

                    <form
                        id="payroll-edit-form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <Card className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-sky-600" />
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Pembaruan Payroll
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Sesuaikan status administrasi dan
                                        dokumentasi payroll ini.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="status"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Status Payroll
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(event) =>
                                            setData(
                                                "status",
                                                event.target.value as
                                                    | "draft"
                                                    | "paid",
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                    >
                                        <option value="draft">
                                            Draft
                                        </option>
                                        <option value="paid">
                                            Lunas
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-sm text-rose-600">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="attachment"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Lampiran Baru
                                    </label>
                                    <input
                                        id="attachment"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(event) =>
                                            setData(
                                                "attachment",
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Kosongkan jika tidak ingin mengganti
                                        lampiran.
                                    </p>
                                    {payroll.attachmentUrl && (
                                        <a
                                            href={payroll.attachmentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium text-sky-600 underline"
                                        >
                                            Lihat lampiran saat ini
                                        </a>
                                    )}
                                    {errors.attachment && (
                                        <p className="text-sm text-rose-600">
                                            {errors.attachment}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label
                                        htmlFor="note"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Catatan
                                    </label>
                                    <textarea
                                        id="note"
                                        value={data.note}
                                        onChange={(event) =>
                                            setData("note", event.target.value)
                                        }
                                        rows={5}
                                        placeholder="Tambahkan catatan pembayaran atau keterangan administrasi payroll"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                    />
                                    {errors.note && (
                                        <p className="text-sm text-rose-600">
                                            {errors.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card className="border-amber-200 bg-amber-50/70 p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                                <div className="space-y-1 text-sm text-amber-900">
                                    <p className="font-medium">
                                        Yang tidak berubah dari halaman ini
                                    </p>
                                    <p>
                                        Nilai gaji pokok, komisi, tunjangan,
                                        denda, kasbon, dan detail komponen
                                        payroll tetap memakai hasil proses
                                        payroll awal.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

PayrollEdit.layout = withAuthenticatedLayout({
    title: "Edit Payroll",
    searchable: true,
    breadcrumbs: [
        { label: "Penggajian", href: route("payrolls.index") },
        { label: "Edit Payroll", href: route("payrolls.index") },
    ],
});

export default PayrollEdit;
