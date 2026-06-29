import React, { useMemo } from "react";
import { router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Table } from "@/Components/Table";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    ListOrdered,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { LaundryService, LaundryServiceProcess } from "@/types";
import { formatDate } from "@/lib/utils";

interface LaundryServiceProcessesIndexProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}

const LaundryServiceProcessesIndex: React.FC<
    LaundryServiceProcessesIndexProps
> = ({ laundryService, isLoading = false }) => {
    const processes = laundryService.laundryServiceProcesses || [];

    const handleAddProcess = () => {
        router.visit(
            route(
                "laundry-services.laundry-service-processes.create",
                laundryService.id,
            ),
        );
    };

    const handleView = (processId: number) => {
        router.visit(
            route("laundry-services.laundry-service-processes.show", {
                laundryService: laundryService.id,
                laundryServiceProcess: processId,
            }),
        );
    };

    const handleEdit = (processId: number) => {
        router.visit(
            route("laundry-services.laundry-service-processes.edit", {
                laundryService: laundryService.id,
                laundryServiceProcess: processId,
            }),
        );
    };

    const handleDelete = (processId: number) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus proses ini dari layanan?",
            )
        ) {
            router.delete(
                route("laundry-services.laundry-service-processes.destroy", {
                    laundryService: laundryService.id,
                    laundryServiceProcess: processId,
                }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const columns: ColumnDef<LaundryServiceProcess>[] = useMemo(
        () => [
            {
                accessorKey: "sequence",
                header: "Urutan",
                cell: ({ row }) => {
                    const process = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full shadow-sm"
                                style={{
                                    backgroundColor: "var(--color-primary-600)",
                                    color: "white",
                                }}
                            >
                                {process.sequence}
                            </span>
                        </div>
                    );
                },
                size: 100,
            },
            {
                accessorKey: "process",
                header: "Nama Proses",
                cell: ({ row }) => {
                    const serviceProcess = row.original;
                    const process = serviceProcess.process;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-semibold text-base"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {process.name}
                            </div>
                            {process.description && (
                                <div
                                    className="text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {process.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 350,
            },
            {
                accessorKey: "process.isActive",
                header: "Status",
                cell: ({ row }) => {
                    const process = row.original.process;
                    const isActive = process.isActive;

                    return (
                        <Badge
                            variant={isActive ? "success" : "error"}
                            className="font-medium"
                        >
                            {isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "createdAt",
                header: "Ditambahkan",
                cell: ({ row }) => {
                    const serviceProcess = row.original;
                    return (
                        <div
                            className="text-sm"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {formatDate(
                                serviceProcess.createdAt,
                                "DD MMMM YYYY",
                            )}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const serviceProcess = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="info"
                                size="sm"
                                onClick={() => handleView(serviceProcess.id)}
                                leftIcon={<Eye className="w-4 h-4" />}
                            >
                                Detail
                            </Button>
                            <Button
                                type="button"
                                variant="warning"
                                size="sm"
                                onClick={() => handleEdit(serviceProcess.id)}
                                leftIcon={<Edit className="w-4 h-4" />}
                            >
                                Edit
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(serviceProcess.id)}
                                leftIcon={<Trash2 className="w-4 h-4" />}
                            >
                                Hapus
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 200,
            },
        ],
        [laundryService.id],
    );

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <h3
                            className="text-xl font-semibold flex items-center gap-2"
                            style={{
                                color: "var(--color-text-primary)",
                            }}
                        >
                            <ListOrdered className="w-5 h-5" />
                            Proses Layanan
                        </h3>
                        <p
                            className="text-sm"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            Daftar urutan proses untuk layanan{" "}
                            <span className="font-semibold">
                                {laundryService.name}
                            </span>
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={handleAddProcess}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Tambah Proses
                    </Button>
                </div>

                <Table
                    data={processes}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada proses untuk layanan ini. Klik 'Tambah Proses' untuk menambahkan proses baru."
                    pageSize={10}
                    className="w-full"
                />
            </Card>

            {processes.length > 0 && (
                <Card
                    variant="outlined"
                    className="p-4"
                    style={{
                        backgroundColor: "var(--color-info-50)",
                        borderColor: "var(--color-info-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <ListOrdered
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            style={{
                                color: "var(--color-info-600)",
                            }}
                        />
                        <div>
                            <h4
                                className="text-sm font-semibold mb-1"
                                style={{
                                    color: "var(--color-info-700)",
                                }}
                            >
                                Urutan Proses
                            </h4>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            >
                                Proses akan dijalankan sesuai urutan yang
                                ditampilkan. Urutan nomor 1 akan dikerjakan
                                terlebih dahulu, diikuti dengan urutan
                                berikutnya.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LaundryServiceProcessesIndex;
43;
