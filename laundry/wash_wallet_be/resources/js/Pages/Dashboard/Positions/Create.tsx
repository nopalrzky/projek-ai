import React from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, UserPlus, Building2, ShieldCheck } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input, TextAreaInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { PositionCreateProps } from "./types";
import { PositionFormData } from "@/types";
import PageHeader from "@/Components/Page/PageHeader";

const PositionCreate = ({ outlets, permissionCatalog }: PositionCreateProps) => {
    const { data, setData, post, processing, errors, reset } =
        useForm<PositionFormData>({
            outletId: 0,
            name: "",
            description: "",
            permissions: [],
        });

    const handlePermissionToggle = (key: string) => {
        const current = data.permissions || [];
        if (current.includes(key)) {
            setData("permissions", current.filter(k => k !== key));
        } else {
            setData("permissions", [...current, key]);
        }
    };

    const handleGroupToggle = (keys: string[]) => {
        const current = data.permissions || [];
        const allSelected = keys.every((k) => current.includes(k));
        if (allSelected) {
            setData(
                "permissions",
                current.filter((k) => !keys.includes(k)),
            );
        } else {
            const next = new Set(current);
            keys.forEach((k) => next.add(k));
            setData("permissions", Array.from(next));
        }
    };

    const handleSelectAllGlobal = (select: boolean) => {
        if (select) {
            const all = permissionCatalog.flatMap((g) =>
                g.permissions.map((p) => p.key),
            );
            setData("permissions", all);
        } else {
            setData("permissions", []);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("positions.store"), {
            onSuccess: () => reset(),
            onError: (errors) => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                console.error("Form submission errors:", errors);
            },
        });
    };

    const outletOptions = [
        { value: "", label: "Pilih Outlet..." },
        ...outlets.map((outlet) => ({
            value: outlet.id.toString(),
            label: `${outlet.name} (${outlet.code})`,
        })),
    ];

    return (
        <>
            <Head title="Tambah Posisi Baru" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Tambah Posisi Baru"
                        subtitle="Buat posisi atau jabatan baru untuk karyawan di outlet tertentu"
                        icon={UserPlus}
                        animate={true}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                {/* Outlet Selection */}
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Building2
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Pilih Outlet
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan outlet untuk posisi ini
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <SelectInput
                                            label="Outlet"
                                            value={
                                                data.outletId === 0
                                                    ? ""
                                                    : data.outletId?.toString()
                                            }
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData(
                                                    "outletId",
                                                    value === ""
                                                        ? 0
                                                        : parseInt(value),
                                                );
                                            }}
                                            options={outletOptions}
                                            error={errors.outletId}
                                            required
                                            disabled={processing}
                                            hint="Pilih outlet tempat posisi ini akan dibuat"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-info-100)",
                                            }}
                                        >
                                            <UserPlus
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-info-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Informasi Posisi
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Detail dan spesifikasi posisi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Nama Posisi"
                                                placeholder="Contoh: Kasir, Manager, Karyawan Laundry"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.name}
                                                required
                                                disabled={processing}
                                                leftIcon={
                                                    <UserPlus className="w-5 h-5" />
                                                }
                                                hint="Nama jabatan atau posisi"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <TextAreaInput
                                                label="Deskripsi Posisi"
                                                placeholder="Jelaskan tanggung jawab dan tugas dari posisi ini..."
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                error={errors.description}
                                                disabled={processing}
                                                hint="Deskripsi detail tentang posisi ini (opsional)"
                                                rows={4}
                                                maxLength={1000}
                                                showCharacterCount={true}
                                                autoResize={true}
                                                minRows={4}
                                                maxRows={8}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hak Akses Posisi (Permissions) */}
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <ShieldCheck
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-warning-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Hak Akses Posisi
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Tentukan izin akses untuk posisi
                                                jabatan ini
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div />
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                id="global_select_all_permissions"
                                                checked={
                                                    permissionCatalog.flatMap(
                                                        (g) =>
                                                            g.permissions.map(
                                                                (p) => p.key,
                                                            ),
                                                    ).length > 0 &&
                                                    (data.permissions || [])
                                                        .length ===
                                                        permissionCatalog.flatMap(
                                                            (g) =>
                                                                g.permissions.map(
                                                                    (p) =>
                                                                        p.key,
                                                                ),
                                                        ).length
                                                }
                                                onChange={(e) =>
                                                    handleSelectAllGlobal(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                            <label
                                                htmlFor="global_select_all_permissions"
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Pilih Semua
                                            </label>
                                            <button
                                                type="button"
                                                className="text-sm text-[var(--color-text-secondary)]"
                                                onClick={() =>
                                                    handleSelectAllGlobal(false)
                                                }
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {permissionCatalog.map((group) => {
                                            const groupKeys =
                                                group.permissions.map(
                                                    (p) => p.key,
                                                );
                                            const allGroupSelected =
                                                groupKeys.every((k) =>
                                                    (
                                                        data.permissions || []
                                                    ).includes(k),
                                                );
                                            return (
                                                <div
                                                    key={group.group}
                                                    className="p-5 rounded-xl border space-y-4"
                                                    style={{
                                                        borderColor:
                                                            "var(--color-border)",
                                                        backgroundColor:
                                                            "var(--color-background-soft, rgba(0, 0, 0, 0.02))",
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3
                                                            className="font-semibold text-base"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            {group.group}
                                                        </h3>
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                allGroupSelected
                                                            }
                                                            onChange={() =>
                                                                handleGroupToggle(
                                                                    groupKeys,
                                                                )
                                                            }
                                                            className="w-4 h-4"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        {group.permissions.map(
                                                            (perm) => {
                                                                const isChecked =
                                                                    (
                                                                        data.permissions ||
                                                                        []
                                                                    ).includes(
                                                                        perm.key,
                                                                    );
                                                                return (
                                                                    <label
                                                                        key={
                                                                            perm.key
                                                                        }
                                                                        className="flex items-center gap-3 cursor-pointer select-none group"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                isChecked
                                                                            }
                                                                            onChange={() =>
                                                                                handlePermissionToggle(
                                                                                    perm.key,
                                                                                )
                                                                            }
                                                                            className="w-4.5 h-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                                            style={{
                                                                                accentColor:
                                                                                    "var(--color-primary-600)",
                                                                            }}
                                                                        />
                                                                        <span
                                                                            className="text-sm font-medium transition-colors"
                                                                            style={{
                                                                                color: isChecked
                                                                                    ? "var(--color-text-primary)"
                                                                                    : "var(--color-text-secondary)",
                                                                            }}
                                                                        >
                                                                            {
                                                                                perm.label
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                        className="mt-6"
                                    />
                                )}

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            (window.location.href =
                                                route("positions.index"))
                                        }
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={
                                            processing ||
                                            !data.name.trim() ||
                                            !data.outletId
                                        }
                                        loading={processing}
                                        size="lg"
                                        leftIcon={<Save className="w-4 h-4" />}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Posisi"}
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

PositionCreate.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Tambah Posisi",
        breadcrumbs: [
            { label: "Posisi", href: route("positions.index") },
            { label: "Tambah Posisi" },
        ],
    })(page);

export default PositionCreate;
