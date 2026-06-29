import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Topup } from "@/types/topup";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Eye, Building2, Coins, Calendar } from "lucide-react";

export const createTopupColumns = (
    onView: (topup: Topup) => void,
    topupType: "master" | "outlet",
): ColumnDef<Topup>[] => [
    {
        accessorKey: "paymentReference",
        header: "Referensi Pembayaran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("topups.show", row.original.id)}
                    className="text-sm font-semibold hover:underline font-mono"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.paymentReference}
                </Link>
                <div className="flex items-center gap-1.5">
                    <Calendar
                        className="w-3 h-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.formattedCreatedAt}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "topupTypeLabel",
        header: "Tipe",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isMasterTopup ? "primary" : "secondary"}
                size="sm"
            >
                {row.original.topupTypeLabel}
            </Badge>
        ),
        enableSorting: false,
    },
    ...(topupType === "master"
        ? [
              {
                  accessorKey: "outletName",
                  header: "Outlet",
                  cell: ({ row }: { row: any }) => (
                      <div className="flex items-start gap-2">
                          <Building2
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              style={{ color: "var(--color-text-tertiary)" }}
                          />
                          <div className="flex flex-col gap-1">
                              <span
                                  className="text-sm font-medium"
                                  style={{ color: "var(--color-text-primary)" }}
                              >
                                  {row.original.outletName || "-"}
                              </span>
                              {row.original.outlet?.code && (
                                  <span
                                      className="text-xs"
                                      style={{
                                          color: "var(--color-text-tertiary)",
                                      }}
                                  >
                                      {row.original.outlet.code}
                                  </span>
                              )}
                          </div>
                      </div>
                  ),
                  enableSorting: false,
              } as ColumnDef<Topup>,
          ]
        : []),
    {
        accessorKey: "formattedAmountMoney",
        header: "Jumlah Uang",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.formattedAmountMoney}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "coinReceived",
        header: "Coin Diterima",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Coins
                    className="w-4 h-4"
                    style={{ color: "var(--color-warning-500)" }}
                />
                <span
                    className="text-sm font-medium font-mono"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.coinReceived.toLocaleString("id-ID")}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    variant={
                        status === "success"
                            ? "success"
                            : status === "failed"
                              ? "error"
                              : "warning"
                    }
                    size="sm"
                >
                    {status === "success"
                        ? "Sukses"
                        : status === "failed"
                          ? "Gagal"
                          : "Pending"}
                </Badge>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "paymentStatus",
        header: "Status Pembayaran",
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
            return (
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            paymentStatus === "paid"
                                ? "success"
                                : paymentStatus === "failed" ||
                                    paymentStatus === "expired"
                                  ? "error"
                                  : paymentStatus === "waiting"
                                    ? "warning"
                                    : "secondary"
                        }
                        size="sm"
                    >
                        {paymentStatus === "paid"
                            ? "Lunas"
                            : paymentStatus === "waiting"
                              ? "Menunggu"
                              : paymentStatus === "failed"
                                ? "Gagal"
                                : paymentStatus === "expired"
                                  ? "Kadaluarsa"
                                  : "Pending"}
                    </Badge>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "paymentProvider",
        header: "Provider",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-primary)" }}
            >
                {row.original.paymentProvider || "-"}
            </span>
        ),
        enableSorting: false,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="info"
                    size="sm"
                    onClick={() => onView(row.original)}
                    leftIcon={<Eye className="w-4 h-4" />}
                    title="Lihat detail"
                />
            </div>
        ),
        enableSorting: false,
    },
];
