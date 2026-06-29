import {
    Home,
    Package,
    Building2,
    Tag,
    UserCheck,
    UserPlus,
    ShoppingBag,
    BadgeDollarSign,
    BookMinus,
    HandCoins,
    Wallet,
    BookOpenText,
    Landmark,
    Scale,
    TrendingUp,
    Banknote,
    Briefcase,
    Gavel,
    Settings,
    FileSpreadsheet,
    Crown,
    Archive,
    User,
    Bell,
    Calendar,
    FileText,
    LayoutDashboard,
    Columns,
} from "lucide-react";
import type { SidebarSection } from "./types";

export const getSidebarMenu = (
    user: any,
    unreadCount: number = 0,
): SidebarSection[] => {
    const userRoles: string[] =
        user?.roles || (user?.role ? [user.role] : ["owner"]);

    const menu: SidebarSection[] = [
        {
            id: "main",
            title: "Utama",
            items: [
                {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: Home,
                    href: route("dashboard"),
                },
                {
                    id: "profile",
                    label: "Profil Saya",
                    icon: User,
                    href: route("profile.index"),
                },
                {
                    id: "notifications",
                    label: "Notifikasi",
                    icon: Bell,
                    href: route("notifications.index"),
                    badge: unreadCount > 0 ? unreadCount : undefined,
                },
            ],
        },
        {
            id: "wallet",
            title: "Keuangan Owner",
            items: [
                {
                    id: "wallet-balance",
                    label: "Dompet Pendapatan",
                    icon: Wallet,
                    href: route("wallet.index"),
                    roles: ["owner"],
                },
                {
                    id: "owner-bank-accounts",
                    label: "Rekening Bank Saya",
                    icon: Landmark,
                    href: route("bank-accounts.index"),
                    roles: ["owner"],
                },
                {
                    id: "wallet-withdrawals",
                    label: "Tarik Saldo",
                    icon: Banknote,
                    href: route("wallet-withdrawals.index"),
                    roles: ["owner"],
                },
                {
                    id: "topups",
                    label: "Topup Koin",
                    icon: HandCoins,
                    href: route("topups.index"),
                },
                {
                    id: "coin-transactions",
                    label: "Riwayat Transaksi Koin",
                    icon: Wallet,
                    href: route("coin-transactions.index"),
                },
                {
                    id: "transfer-coins",
                    label: "Transfer ke Outlet",
                    icon: Wallet,
                    href: route("topups.index"),
                },
            ],
        },
        {
            id: "operational",
            title: "Operasional",
            items: [
                {
                    id: "orders",
                    label: "Manajemen Order",
                    icon: ShoppingBag,
                    href: route("orders.index"),
                },
                {
                    id: "expenses",
                    label: "Catat Pengeluaran",
                    icon: Banknote,
                    href: route("expenses.index"),
                },
                {
                    id: "deposits",
                    label: "Setoran Kas Outlet",
                    icon: Archive,
                    href: route("deposits.index"),
                },
                {
                    id: "customers",
                    label: "Data Pelanggan",
                    icon: UserPlus,
                    href: route("customers.index"),
                },
                {
                    id: "employees",
                    label: "Data Karyawan",
                    icon: UserCheck,
                    href: route("employees.index"),
                },
                {
                    id: "outlets",
                    label: "Kelola Outlet",
                    icon: Building2,
                    href: route("outlets.index"),
                },
                {
                    id: "laundry-services",
                    label: "Layanan Laundry",
                    icon: Package,
                    href: route("laundry-services.index"),
                },
                {
                    id: "membership-contracts",
                    label: "Daftar Membership",
                    icon: Crown,
                    href: route("membership-contracts.index"),
                },
                {
                    id: "customer-subscriptions",
                    label: "Deposit Pelanggan",
                    icon: Archive,
                    href: route("customer-subscriptions.index"),
                },
                {
                    id: "petty-cashes",
                    label: "Kas Kecil",
                    icon: Wallet,
                    href: route("petty-cashes.index"),
                },
                {
                    id: "prives",
                    label: "Prive",
                    icon: BadgeDollarSign,
                    href: route("prives.index"),
                },
                {
                    id: "affiliates",
                    label: "Afiliasi",
                    icon: UserPlus,
                    href: route("affiliates.index"),
                },
            ],
        },
        {
            id: "hr-finance",
            title: "Keuangan Karyawan",
            items: [
                {
                    id: "payroll-process",
                    label: "Proses Gaji (Payroll)",
                    icon: Wallet,
                    href: route("payrolls.index"),
                },

                {
                    id: "loans",
                    label: "Kasbon (Loan)",
                    icon: HandCoins,
                    href: route("loans.index"),
                },
                {
                    id: "fine-logs",
                    label: "Catat Denda",
                    icon: BookMinus,
                    href: route("fine-logs.index"),
                },
                {
                    id: "positions",
                    label: "Jabatan / Posisi",
                    icon: Briefcase,
                    href: route("positions.index"),
                },
            ],
        },
        {
            id: "accounting",
            title: "Akuntansi & Laporan",
            items: [
                {
                    id: "coa",
                    label: "Daftar Akun (COA)",
                    icon: Landmark,
                    href: route("accounts.index"),
                },
                {
                    id: "journal",
                    label: "Jurnal Umum",
                    icon: BookOpenText,
                    href: route("journal-entries.index"),
                },
                {
                    id: "general-ledger",
                    label: "Buku Besar",
                    icon: FileSpreadsheet,
                    href: route("general-ledger.index"),
                    children: [
                        {
                            id: "gl-detail",
                            label: "Detail Transaksi",
                            icon: FileText,
                            href: route("general-ledger.index"),
                        },
                        {
                            id: "gl-summary",
                            label: "Ringkasan Saldo",
                            icon: LayoutDashboard,
                            href: route("general-ledger.summary"),
                        },
                        {
                            id: "gl-compare",
                            label: "Bandingkan Akun",
                            icon: Columns,
                            href: route("general-ledger.compare"),
                        },
                    ],
                },
                {
                    id: "accounting-periods",
                    label: "Periode Akuntansi",
                    icon: Calendar,
                    href: route("accounting-periods.index"),
                },
                {
                    id: "report-profit-loss",
                    label: "Laba Rugi",
                    icon: TrendingUp,
                    href: route("profit-loss.index"),
                },
                {
                    id: "report-balance-sheet",
                    label: "Neraca",
                    icon: Scale,
                    href: route("balance-sheet.index"),
                },
            ],
        },
        {
            id: "master-data",
            title: "Pengaturan Data",
            items: [
                {
                    id: "categories",
                    label: "Kategori Layanan",
                    icon: Tag,
                    href: route("categories.index"),
                },
                {
                    id: "service-packages",
                    label: "Atur Deposit",
                    icon: Archive,
                    href: route("service-packages.index"),
                },
                {
                    id: "membership-plans",
                    label: "Paket Membership",
                    icon: Crown,
                    href: route("membership-plans.index"),
                },
                {
                    id: "fines",
                    label: "Jenis Denda",
                    icon: Gavel,
                    href: route("fines.index"),
                },
                {
                    id: "salary-components",
                    label: "Komponen Gaji",
                    icon: Settings,
                    href: route("salaries.index"),
                    roles: ["super_admin"],
                },
                {
                    id: "units",
                    label: "Satuan",
                    icon: Scale,
                    href: route("units.index"),
                    roles: ["super_admin"],
                },
                {
                    id: "system-settings",
                    label: "Pengaturan Sistem",
                    icon: Settings,
                    href: route("settings.index"),
                    roles: ["super_admin"],
                },
                {
                    id: "admin-withdrawal-banks",
                    label: "Bank Master (Withdrawal)",
                    icon: Landmark,
                    href: route("admin.withdrawal-banks.index"),
                    roles: ["super_admin"],
                },
                {
                    id: "admin-wallet-withdrawals",
                    label: "Antrean Penarikan Dana",
                    icon: Banknote,
                    href: route("admin.wallet-withdrawals.index"),
                    roles: ["super_admin"],
                },
            ],
        },
    ];

    return menu
        .filter((section) => {
            if (!section.roles || section.roles.length === 0) return true;
            return section.roles.some((role) => userRoles.includes(role));
        })
        .map((section) => {
            const filteredItems = section.items.filter((item) => {
                if (!item.roles || item.roles.length === 0) return true;
                return item.roles.some((role) => userRoles.includes(role));
            });

            return {
                ...section,
                items: filteredItems,
            };
        })
        .filter((section) => section.items.length > 0);
};
