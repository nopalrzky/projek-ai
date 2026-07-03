<?php

namespace App\Enums;

enum Permission: string
{
    case CashierDashboardView = 'cashier_dashboard.view';
    case OrderView = 'order.view';
    case OrderCreate = 'order.create';
    case OrderUpdate = 'order.update';
    case OrderDelete = 'order.delete';
    case OrderAccept = 'order.accept';
    case OrderReject = 'order.reject';
    case OrderStart = 'order.start';
    case OrderComplete = 'order.complete';
    case OrderWeigh = 'order.weigh';
    case OrderPaymentManage = 'order.payment.manage';
    case OrderPrint = 'order.print';
    case OrderWaNotificationPreview = 'order.wa_notification.preview';
    case OrderWaNotificationSend = 'order.wa_notification.send';
    case CustomerView = 'customer.view';
    case CustomerCreate = 'customer.create';
    case CustomerUpdate = 'customer.update';
    case CustomerDelete = 'customer.delete';
    case CustomerSubscriptionView = 'customer_subscription.view';
    case CustomerSubscriptionCreate = 'customer_subscription.create';
    case CustomerSubscriptionUpdate = 'customer_subscription.update';
    case CustomerSubscriptionDelete = 'customer_subscription.delete';
    case MembershipPlanView = 'membership_plan.view';
    case MembershipContractView = 'membership_contract.view';
    case MembershipContractCreate = 'membership_contract.create';
    case CategoryView = 'category.view';
    case CategoryCreate = 'category.create';
    case CategoryUpdate = 'category.update';
    case CategoryDelete = 'category.delete';
    case LaundryServiceView = 'laundry_service.view';
    case LaundryServiceCreate = 'laundry_service.create';
    case LaundryServiceUpdate = 'laundry_service.update';
    case LaundryServiceDelete = 'laundry_service.delete';
    case ServicePackageView = 'service_package.view';
    case UnitView = 'unit.view';
    case AccountView = 'account.view';
    case DepositView = 'deposit.view';
    case DepositCreate = 'deposit.create';
    case DepositUpdate = 'deposit.update';
    case PettyCashView = 'petty_cash.view';
    case PettyCashCreate = 'petty_cash.create';
    case PettyCashUpdate = 'petty_cash.update';
    case ExpenseView = 'expense.view';
    case ExpenseCreate = 'expense.create';
    case ExpenseUpdate = 'expense.update';
    case ExpenseDelete = 'expense.delete';
    case ProductionView = 'production.view';
    case ProductionManage = 'production.manage';
    case CourierView = 'courier.view';
    case CourierManage = 'courier.manage';

    public function label(): string
    {
        return match ($this) {
            self::CashierDashboardView => 'Lihat Dashboard Kasir',
            self::OrderView => 'Lihat Order',
            self::OrderCreate => 'Buat Order',
            self::OrderUpdate => 'Edit Order',
            self::OrderDelete => 'Hapus Order',
            self::OrderAccept => 'Terima Order',
            self::OrderReject => 'Tolak Order',
            self::OrderStart => 'Mulai Order',
            self::OrderComplete => 'Selesaikan Order',
            self::OrderWeigh => 'Timbang Order',
            self::OrderPaymentManage => 'Kelola Pembayaran Order',
            self::OrderPrint => 'Cetak Struk dan Label',
            self::OrderWaNotificationPreview => 'Preview Notifikasi WA',
            self::OrderWaNotificationSend => 'Kirim Notifikasi WA',
            self::CustomerView => 'Lihat Customer',
            self::CustomerCreate => 'Buat Customer',
            self::CustomerUpdate => 'Edit Customer',
            self::CustomerDelete => 'Hapus Customer',
            self::CustomerSubscriptionView => 'Lihat Subscription Customer',
            self::CustomerSubscriptionCreate => 'Buat Subscription Customer',
            self::CustomerSubscriptionUpdate => 'Edit Subscription Customer',
            self::CustomerSubscriptionDelete => 'Hapus Subscription Customer',
            self::MembershipPlanView => 'Lihat Paket Membership',
            self::MembershipContractView => 'Lihat Kontrak Membership',
            self::MembershipContractCreate => 'Buat Kontrak Membership',
            self::CategoryView => 'Lihat Kategori Layanan',
            self::CategoryCreate => 'Buat Kategori Layanan',
            self::CategoryUpdate => 'Edit Kategori Layanan',
            self::CategoryDelete => 'Hapus Kategori Layanan',
            self::LaundryServiceView => 'Lihat Layanan Laundry',
            self::LaundryServiceCreate => 'Buat Layanan Laundry',
            self::LaundryServiceUpdate => 'Edit Layanan Laundry',
            self::LaundryServiceDelete => 'Hapus Layanan Laundry',
            self::ServicePackageView => 'Lihat Paket Layanan',
            self::UnitView => 'Lihat Unit',
            self::AccountView => 'Lihat Akun Keuangan',
            self::DepositView => 'Lihat Setoran',
            self::DepositCreate => 'Buat Setoran',
            self::DepositUpdate => 'Edit Setoran',
            self::PettyCashView => 'Lihat Petty Cash',
            self::PettyCashCreate => 'Buat Petty Cash',
            self::PettyCashUpdate => 'Edit Petty Cash',
            self::ExpenseView => 'Lihat Pengeluaran Outlet',
            self::ExpenseCreate => 'Buat Pengeluaran Outlet',
            self::ExpenseUpdate => 'Edit Pengeluaran Outlet',
            self::ExpenseDelete => 'Hapus Pengeluaran Outlet',
            self::ProductionView => 'Lihat Produksi',
            self::ProductionManage => 'Kelola Produksi',
            self::CourierView => 'Lihat Kurir',
            self::CourierManage => 'Kelola Kurir',
        };
    }

    public function group(): string
    {
        return match ($this) {
            self::CashierDashboardView => 'Dashboard Kasir',
            self::OrderView, self::OrderCreate, self::OrderUpdate, self::OrderDelete, self::OrderAccept, self::OrderReject, self::OrderStart, self::OrderComplete, self::OrderWeigh, self::OrderPaymentManage, self::OrderPrint, self::OrderWaNotificationPreview, self::OrderWaNotificationSend => 'Order',
            self::CustomerView, self::CustomerCreate, self::CustomerUpdate, self::CustomerDelete, self::CustomerSubscriptionView, self::CustomerSubscriptionCreate, self::CustomerSubscriptionUpdate, self::CustomerSubscriptionDelete, self::MembershipPlanView, self::MembershipContractView, self::MembershipContractCreate => 'Customer & Membership',
            self::CategoryView, self::CategoryCreate, self::CategoryUpdate, self::CategoryDelete, self::LaundryServiceView, self::LaundryServiceCreate, self::LaundryServiceUpdate, self::LaundryServiceDelete, self::ServicePackageView, self::UnitView => 'Layanan & Setup Operasional',
            self::AccountView, self::DepositView, self::DepositCreate, self::DepositUpdate, self::PettyCashView, self::PettyCashCreate, self::PettyCashUpdate, self::ExpenseView, self::ExpenseCreate, self::ExpenseUpdate, self::ExpenseDelete => 'Keuangan Cashier',
            self::ProductionView, self::ProductionManage => 'Produksi',
            self::CourierView, self::CourierManage => 'Kurir',
        };
    }

    public static function defaultForSlug(string $slug): array
    {
        return match ($slug) {
            'kasir' => [
                self::CashierDashboardView->value,
                self::OrderView->value,
                self::OrderCreate->value,
                self::OrderUpdate->value,
                self::OrderDelete->value,
                self::OrderAccept->value,
                self::OrderReject->value,
                self::OrderStart->value,
                self::OrderComplete->value,
                self::OrderWeigh->value,
                self::OrderPaymentManage->value,
                self::OrderPrint->value,
                self::OrderWaNotificationPreview->value,
                self::OrderWaNotificationSend->value,
                self::CustomerView->value,
                self::CustomerCreate->value,
                self::CustomerUpdate->value,
                self::CustomerDelete->value,
                self::CustomerSubscriptionView->value,
                self::CustomerSubscriptionCreate->value,
                self::CustomerSubscriptionUpdate->value,
                self::CustomerSubscriptionDelete->value,
                self::MembershipPlanView->value,
                self::MembershipContractView->value,
                self::MembershipContractCreate->value,
                self::CategoryView->value,
                self::CategoryCreate->value,
                self::CategoryUpdate->value,
                self::CategoryDelete->value,
                self::LaundryServiceView->value,
                self::LaundryServiceCreate->value,
                self::LaundryServiceUpdate->value,
                self::LaundryServiceDelete->value,
                self::ServicePackageView->value,
                self::UnitView->value,
                self::AccountView->value,
                self::DepositView->value,
                self::DepositCreate->value,
                self::DepositUpdate->value,
                self::PettyCashView->value,
                self::PettyCashCreate->value,
                self::PettyCashUpdate->value,
                self::ExpenseView->value,
                self::ExpenseCreate->value,
                self::ExpenseUpdate->value,
                self::ExpenseDelete->value,
            ],
            'produksi' => [
                self::OrderView->value,
                self::ProductionView->value,
                self::ProductionManage->value,
            ],
            'kurir' => [
                self::OrderView->value,
                self::CourierView->value,
                self::CourierManage->value,
            ],
            default => [],
        };
    }
}
