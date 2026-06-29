<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OutletOverviewService
{
    private array $statusColors = [
        'requested'        => '#94a3b8',
        'accepted'         => '#60a5fa',
        'picking_up'       => '#818cf8',
        'picked_up'        => '#a78bfa',
        'received'         => '#34d399',
        'weighing'         => '#fbbf24',
        'ready_to_process' => '#f59e0b',
        'in_progress'      => '#f97316',
        'ready'            => '#22c55e',
        'delivering'       => '#3b82f6',
        'delivered'        => '#10b981',
        'completed'        => '#16a34a',
        'cancelled'        => '#ef4444',
        'rejected'         => '#b91c1c',
        'pending_dropoff'   => '#8b5cf6',
    ];

    public function buildPayload(Outlet $outlet, string $period = '30d'): array
    {
        $period = $this->validatePeriod($period);
        $timezone = $outlet->timezone ?? 'Asia/Jakarta';
        [$startDate, $endDate, $today] = $this->resolveDateRange($period, $timezone);

        return [
            'stats'        => $this->buildStats($outlet, $startDate, $endDate, $today),
            'charts'       => $this->buildCharts($outlet, $startDate, $endDate),
            'recentOrders' => $this->buildRecentOrders($outlet),
            'checklist'    => $this->buildOperationalChecklist($outlet),
            'meta'         => [
                'period'      => $period,
                'startDate'   => $startDate->toDateString(),
                'endDate'     => $endDate->toDateString(),
                'generatedAt' => Carbon::now($timezone)->toISOString(),
            ],
        ];
    }

    private function validatePeriod(string $period): string
    {
        return in_array($period, ['7d', '30d', '90d']) ? $period : '30d';
    }

    private function resolveDateRange(string $period, string $timezone): array
    {
        $tz = new \DateTimeZone($timezone);
        $today = Carbon::now($tz)->startOfDay();
        $days = match ($period) {
            '7d'  => 7,
            '90d' => 90,
            default => 30,
        };
        $startDate = $today->copy()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now($tz)->endOfDay();
        return [$startDate, $endDate, $today];
    }

    private function buildStats(Outlet $outlet, Carbon $startDate, Carbon $endDate, Carbon $today): array
    {
        $outletId = $outlet->id;
        $terminalStatuses = [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED];
        $unpaidStatuses = [Order::PAYMENT_STATUS_UNPAID, Order::PAYMENT_STATUS_PARTIAL];

        $todayOrdersCount = Order::byOutletId($outletId)
            ->whereDate('created_at', $today)
            ->whereNotIn('status', $terminalStatuses)
            ->count();

        $periodOrdersCount = Order::byOutletId($outletId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotIn('status', $terminalStatuses)
            ->count();

        $periodRevenue = (float) Order::byOutletId($outletId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotIn('status', $terminalStatuses)
            ->sum('total_amount');

        $activeOrdersCount = Order::byOutletId($outletId)
            ->whereNotIn('status', $terminalStatuses)
            ->count();

        $unpaidOrdersCount = Order::byOutletId($outletId)
            ->whereIn('payment_status', $unpaidStatuses)
            ->count();

        $outstandingAmount = (float) Order::byOutletId($outletId)
            ->whereIn('payment_status', $unpaidStatuses)
            ->sum('remaining_amount');

        $customersCount = $outlet->customers()->count();

        $activeLaundryServicesCount = $outlet->laundryServices()
            ->whereNull('laundry_services.deleted_at')
            ->whereHas('category', fn($q) => $q->whereNull('categories.deleted_at'))
            ->count();

        $activeEmployeesCount = $outlet->employees()
            ->whereNull('employees.deleted_at')
            ->count();

        $reviews = $outlet->orderReviews()->where('is_published', true)->get();
        $averageRating = $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 0;
        $totalReviews = $reviews->count();

        $coinBalance = $outlet->owner?->coin_balance ?? 0;

        $featureStatusSummary = [
            'active'   => 0,
            'trial'    => 0,
            'expired'  => 0,
            'inactive' => 0,
        ];
        foreach ($outlet->outletFeatures as $feature) {
            $status = $feature->status;
            if (isset($featureStatusSummary[$status])) {
                $featureStatusSummary[$status]++;
            }
        }

        return [
            'period' => [
                'preset'    => $this->validatePeriod(request()->input('period', '30d')),
                'startDate' => $startDate->toDateString(),
                'endDate'   => $endDate->toDateString(),
            ],
            'todayOrdersCount'            => $todayOrdersCount,
            'periodOrdersCount'           => $periodOrdersCount,
            'periodRevenue'               => $periodRevenue,
            'activeOrdersCount'            => $activeOrdersCount,
            'unpaidOrdersCount'           => $unpaidOrdersCount,
            'outstandingAmount'            => $outstandingAmount,
            'customersCount'              => $customersCount,
            'activeLaundryServicesCount'  => $activeLaundryServicesCount,
            'activeEmployeesCount'        => $activeEmployeesCount,
            'averageRating'               => $averageRating,
            'totalReviews'                => $totalReviews,
            'coinBalance'                 => $coinBalance,
            'featureStatusSummary'        => $featureStatusSummary,
        ];
    }

    private function buildCharts(Outlet $outlet, Carbon $startDate, Carbon $endDate): array
    {
        return [
            'revenueAndOrdersByDay'    => $this->getRevenueAndOrdersByDay($outlet, $startDate, $endDate),
            'orderStatusDistribution'  => $this->getOrderStatusDistribution($outlet, $startDate, $endDate),
            'paymentHealth'            => $this->getPaymentHealth($outlet, $startDate, $endDate),
            'topServices'              => $this->getTopServices($outlet, $startDate, $endDate),
            'topCategories'            => $this->getTopCategories($outlet, $startDate, $endDate),
        ];
    }

    private function getRevenueAndOrdersByDay(Outlet $outlet, Carbon $startDate, Carbon $endDate): array
    {
        $terminalStatuses = [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED];

        $data = Order::byOutletId($outlet->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotIn('status', $terminalStatuses)
            ->selectRaw("DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders_count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $dateStr = $current->toDateString();
            $row = $data->get($dateStr);
            $result[] = [
                'date'        => $dateStr,
                'revenue'     => $row ? (float) $row->revenue : 0,
                'ordersCount' => $row ? (int) $row->orders_count : 0,
            ];
            $current->addDay();
        }

        return $result;
    }

    private function getOrderStatusDistribution(Outlet $outlet, Carbon $startDate, Carbon $endDate): array
    {
        $data = Order::byOutletId($outlet->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $statusLabels = [
            'requested'        => 'Diajukan',
            'accepted'         => 'Diterima',
            'picking_up'       => 'Sedang Dijemput',
            'picked_up'        => 'Sudah Diambil',
            'received'         => 'Di Outlet',
            'weighing'         => 'Ditimbang',
            'ready_to_process' => 'Siap Dikerjakan',
            'in_progress'      => 'Sedang Dikerjakan',
            'ready'            => 'Siap Diantar',
            'delivering'       => 'Sedang Diantar',
            'delivered'        => 'Terkirim',
            'completed'        => 'Selesai',
            'cancelled'        => 'Dibatalkan',
            'rejected'         => 'Ditolak',
            'pending_dropoff'  => 'Menunggu Drop-off',
        ];

        return $data->map(fn($row) => [
            'status' => $row->status,
            'label'  => $statusLabels[$row->status] ?? $row->status,
            'count'  => (int) $row->count,
            'color'  => $this->statusColors[$row->status] ?? '#94a3b8',
        ])->toArray();
    }

    private function getPaymentHealth(Outlet $outlet, Carbon $startDate, Carbon $endDate): array
    {
        $data = Order::byOutletId($outlet->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('payment_status')
            ->selectRaw('COUNT(*) as orders_count, SUM(total_amount) as total_amount, SUM(paid_amount) as paid_amount, SUM(remaining_amount) as remaining_amount')
            ->groupBy('payment_status')
            ->get();

        $labels = [
            'not_yet_priced'  => 'Belum Diharga',
            'unpaid'          => 'Belum Dibayar',
            'partial'         => 'Dibayar Sebagian',
            'paid'            => 'Lunas',
            'paid_by_package' => 'Paket',
            'refunded'        => 'Refund',
            'cod'             => 'COD',
        ];

        return $data->map(fn($row) => [
            'paymentStatus'    => $row->payment_status,
            'label'           => $labels[$row->payment_status] ?? $row->payment_status,
            'ordersCount'     => (int) $row->orders_count,
            'totalAmount'     => (float) $row->total_amount,
            'paidAmount'      => (float) $row->paid_amount,
            'remainingAmount' => (float) $row->remaining_amount,
        ])->toArray();
    }

    private function getTopServices(Outlet $outlet, Carbon $startDate, Carbon $endDate, int $limit = 5): array
    {
        $terminalStatuses = [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED];

        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.outlet_id', $outlet->id)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereNotIn('orders.status', $terminalStatuses)
            ->selectRaw('
                order_items.laundry_service_name as name,
                order_items.category_name,
                COUNT(*) as items_count,
                SUM(order_items.quantity) as quantity,
                SUM(order_items.subtotal) as revenue
            ')
            ->groupBy('order_items.laundry_service_name', 'order_items.category_name')
            ->orderByDesc('quantity')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'name'        => $row->name,
                'categoryName' => $row->category_name,
                'itemsCount'   => (int) $row->items_count,
                'quantity'    => (int) $row->quantity,
                'revenue'     => (float) $row->revenue,
            ])->toArray();
    }

    private function getTopCategories(Outlet $outlet, Carbon $startDate, Carbon $endDate, int $limit = 5): array
    {
        $terminalStatuses = [Order::STATUS_COMPLETED, Order::STATUS_CANCELLED, Order::STATUS_REJECTED];

        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.outlet_id', $outlet->id)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereNotIn('orders.status', $terminalStatuses)
            ->selectRaw('
                order_items.category_name as name,
                COUNT(*) as items_count,
                SUM(order_items.quantity) as quantity,
                SUM(order_items.subtotal) as revenue
            ')
            ->groupBy('order_items.category_name')
            ->orderByDesc('quantity')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'name'       => $row->name,
                'itemsCount'  => (int) $row->items_count,
                'quantity'   => (int) $row->quantity,
                'revenue'    => (float) $row->revenue,
            ])->toArray();
    }

    private function buildRecentOrders(Outlet $outlet, int $limit = 6): array
    {
        $orders = Order::byOutletId($outlet->id)
            ->with('customer')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return $orders->map(fn($order) => [
            'id'                  => $order->id,
            'orderNumber'         => $order->order_number,
            'customerName'        => $order->customer?->name,
            'customerId'          => $order->customer_id,
            'status'              => $order->status,
            'statusLabel'         => $order->getStatusLabel(),
            'statusBadgeVariant'  => $order->getStatusBadgeVariant(),
            'paymentStatus'       => $order->payment_status,
            'paymentStatusLabel'  => $order->getPaymentStatusLabel(),
            'totalAmount'         => (float) $order->total_amount,
            'remainingAmount'     => (float) $order->remaining_amount,
            'orderDate'           => $order->order_date ? (string) $order->order_date : null,
            'createdAt'           => $order->created_at->toISOString(),
        ])->toArray();
    }

    private function buildOperationalChecklist(Outlet $outlet): array
    {
        $checklist = [];

        $checklist[] = $this->checkOperationalDays($outlet);
        $checklist[] = $this->checkActiveServices($outlet);
        $checklist[] = $this->checkEmployees($outlet);
        $checklist[] = $this->checkCourierSetting($outlet);
        $checklist[] = $this->checkCourierSchedule($outlet);
        $checklist[] = $this->checkActivationFeature($outlet);
        $checklist[] = $this->checkExposureFeature($outlet);
        $checklist[] = $this->checkCoordinates($outlet);
        $checklist[] = $this->checkAddress($outlet);

        return $checklist;
    }

    private function checkOperationalDays(Outlet $outlet): array
    {
        $isEmpty = $outlet->operationalDays->isEmpty();
        return [
            'key'          => 'operational_days',
            'label'        => 'Jam Kerja',
            'status'       => $isEmpty ? 'critical' : 'ok',
            'message'      => $isEmpty
                ? 'Belum ada jam kerja yang dikonfigurasi'
                : "{$outlet->operationalDays->count()} hari kerja dikonfigurasi",
            'actionLabel'  => $isEmpty ? 'Atur Jam Kerja' : null,
            'actionTarget' => $isEmpty ? '?tab=2' : null,
        ];
    }

    private function checkActiveServices(Outlet $outlet): array
    {
        $count = $outlet->laundryServices()
            ->whereNull('laundry_services.deleted_at')
            ->whereHas('category', fn($q) => $q->whereNull('categories.deleted_at'))
            ->count();

        return [
            'key'          => 'active_services',
            'label'        => 'Layanan Aktif',
            'status'       => $count === 0 ? 'critical' : 'ok',
            'message'      => $count === 0
                ? 'Belum ada layanan aktif'
                : "{$count} layanan aktif",
            'actionLabel'  => $count === 0 ? 'Tambah Layanan' : null,
            'actionTarget' => $count === 0 ? '?tab=8' : null,
        ];
    }

    private function checkEmployees(Outlet $outlet): array
    {
        $count = $outlet->employees()->whereNull('employees.deleted_at')->count();

        return [
            'key'          => 'employees',
            'label'        => 'Karyawan',
            'status'       => $count === 0 ? 'warning' : 'ok',
            'message'      => $count === 0
                ? 'Belum ada karyawan'
                : "{$count} karyawan aktif",
            'actionLabel'  => $count === 0 ? 'Tambah Karyawan' : null,
            'actionTarget' => $count === 0 ? '?tab=5' : null,
        ];
    }

    private function checkCourierSetting(Outlet $outlet): array
    {
        $isCourierActive = $outlet->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_service');
        $hasSetting = $outlet->courierSetting !== null;

        if (!$isCourierActive) {
            return [
                'key'     => 'courier_setting',
                'label'   => 'Pengaturan Kurir',
                'status'  => 'ok',
                'message' => 'Layanan kurir tidak diaktifkan',
            ];
        }

        return [
            'key'          => 'courier_setting',
            'label'        => 'Pengaturan Kurir',
            'status'       => !$hasSetting ? 'critical' : 'ok',
            'message'      => !$hasSetting
                ? 'Kurir aktif tapi pengaturan belum lengkap'
                : 'Pengaturan kurir sudah lengkap',
            'actionLabel'  => !$hasSetting ? 'Atur Kurir' : null,
            'actionTarget' => !$hasSetting ? '?tab=3' : null,
        ];
    }

    private function checkCourierSchedule(Outlet $outlet): array
    {
        $isCourierActive = $outlet->outletFeatures->contains(fn($f) => $f->feature?->key === 'courier_service');
        $hasSchedules = $outlet->courierSchedules->isNotEmpty() || $outlet->operationalDays->some(fn($d) => $d->courierSchedules->isNotEmpty());

        if (!$isCourierActive) {
            return [
                'key'     => 'courier_schedule',
                'label'   => 'Jadwal Kurir',
                'status'  => 'ok',
                'message' => 'Layanan kurir tidak diaktifkan',
            ];
        }

        return [
            'key'          => 'courier_schedule',
            'label'        => 'Jadwal Kurir',
            'status'       => !$hasSchedules ? 'warning' : 'ok',
            'message'      => !$hasSchedules
                ? 'Belum ada jadwal kurir'
                : 'Jadwal kurir sudah dikonfigurasi',
            'actionLabel'  => !$hasSchedules ? 'Atur Jadwal' : null,
            'actionTarget' => !$hasSchedules ? '?tab=3' : null,
        ];
    }

    private function checkActivationFeature(Outlet $outlet): array
    {
        $activationFeature = $outlet->outletFeatures->first(fn($f) => $f->feature?->key === 'outlet_activation');

        if (!$activationFeature) {
            return [
                'key'          => 'activation_feature',
                'label'        => 'Fitur Aktivasi',
                'status'       => 'critical',
                'message'      => 'Fitur aktivasi belum aktif',
                'actionLabel'  => 'Aktifkan Outlet',
                'actionTarget' => '?tab=1',
            ];
        }

        $status = $activationFeature->status;
        return [
            'key'          => 'activation_feature',
            'label'        => 'Fitur Aktivasi',
            'status'       => $status === 'expired' ? 'critical' : 'ok',
            'message'      => $status === 'expired'
                ? 'Fitur aktivasi sudah expired'
                : "Fitur aktivasi {$status}",
            'actionLabel'  => $status === 'expired' ? 'Perpanjang' : null,
            'actionTarget' => $status === 'expired' ? '?tab=1' : null,
        ];
    }

    private function checkExposureFeature(Outlet $outlet): array
    {
        $exposureFeature = $outlet->outletFeatures->first(fn($f) => $f->feature?->key === 'outlet_exposure');

        if (!$exposureFeature) {
            return [
                'key'     => 'exposure_feature',
                'label'   => 'Fitur Ekspos',
                'status'  => 'ok',
                'message' => 'Fitur ekspos belum diaktifkan',
            ];
        }

        $status = $exposureFeature->status;
        return [
            'key'          => 'exposure_feature',
            'label'        => 'Fitur Ekspos',
            'status'       => $status === 'expired' ? 'warning' : 'ok',
            'message'      => $status === 'expired'
                ? 'Fitur ekspos sudah expired'
                : "Fitur ekspos {$status}",
            'actionLabel'  => $status === 'expired' ? 'Perpanjang' : null,
            'actionTarget' => $status === 'expired' ? '?tab=1' : null,
        ];
    }

    private function checkCoordinates(Outlet $outlet): array
    {
        $hasCoords = $outlet->latitude && $outlet->longitude;

        return [
            'key'          => 'coordinates',
            'label'        => 'Koordinat Outlet',
            'status'       => !$hasCoords ? 'warning' : 'ok',
            'message'      => !$hasCoords
                ? 'Koordinat outlet belum diatur'
                : 'Koordinat outlet sudah diatur',
            'actionLabel'  => !$hasCoords ? 'Atur Lokasi' : null,
            'actionTarget' => !$hasCoords ? route('outlets.edit', $outlet->id) : null,
        ];
    }

    private function checkAddress(Outlet $outlet): array
    {
        $hasAddress = (bool) $outlet->street;

        return [
            'key'          => 'address',
            'label'        => 'Alamat Outlet',
            'status'       => !$hasAddress ? 'info' : 'ok',
            'message'      => !$hasAddress
                ? 'Alamat outlet belum lengkap'
                : 'Alamat outlet sudah lengkap',
            'actionLabel'  => !$hasAddress ? 'Lengkapi Alamat' : null,
            'actionTarget' => !$hasAddress ? route('outlets.edit', $outlet->id) : null,
        ];
    }
}
