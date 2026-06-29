<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\Outlet;
use App\Models\OperationalDay;
use App\Models\Unit;
use App\Models\Position;
use App\Models\PositionPermission;
use App\Models\Employee;
use App\Models\EmployeePosition;
use App\Models\CustomerAccount;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Category;
use App\Models\LaundryService;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CourierSetting;
use App\Models\CourierSchedule;
use App\Models\Account;
use App\Models\Process;
use App\Models\EmployeeProcess;
use App\Models\LaundryServiceProcess;
use App\Models\OrderItemProcess;
use App\Enums\Permission;
use App\Services\AccountService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class GooglePlayReviewerSeeder extends Seeder
{
    public function __construct(
        protected AccountService $accountService
    ) {}

    public function run(): void
    {
        DB::beginTransaction();
        try {
            $this->command->info('🚀 Starting Google Play Reviewer Seeder...');

            $this->command->info('Step 1: Creating owner...');
            $owner = User::firstOrCreate(
                ['email' => 'googleplay.owner@washwallet.test'],
                [
                    'name'          => 'Google Play Demo Owner',
                    'username'      => 'googleplay.owner',
                    'phone'         => '081100009003',
                    'referral_code' => User::generateReferralCode(),
                    'password'      => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2026')),
                    'status'        => 'active',
                ]
            );

            if (!$owner->hasRole('owner')) {
                $owner->assignRole('owner');
            }

            $this->command->info('Step 2: Creating outlet...');
            $outlet = Outlet::firstOrCreate(
                ['code' => 'GPREVIEW'],
                [
                    'owner_id'      => $owner->id,
                    'name'          => 'WashWallet Demo Outlet - Google Play Review',
                    'email'         => 'demo@washwallet.test',
                    'phone'         => '021000099001',
                    'street'        => 'Jl. Demo WashWallet No. 1, Jakarta Selatan',
                    'province_name' => 'DKI Jakarta',
                    'city_name'     => 'Jakarta Selatan',
                    'district_name' => 'Kebayoran Baru',
                    'village_name'  => 'Senayan',
                    'latitude'      => -6.2297,
                    'longitude'     => 106.8081,
                    'status'        => 'active',
                    'timezone'      => 'Asia/Jakarta',
                ]
            );

            $this->command->info('Step 3: Setting up Chart of Accounts...');
            $existingAccountsCount = Account::where('owner_id', $owner->id)->count();
            if ($existingAccountsCount === 0) {
                $this->accountService->generateDefaultAccounts($owner->id);
            }

            if (!Account::where('outlet_id', $outlet->id)->where('account_role', 'cash')->exists()) {
                $this->accountService->createCashAccountForOutlet($owner->id, $outlet->id, $outlet->name);
            }
            if (!Account::where('outlet_id', $outlet->id)->where('account_role', 'receivable')->exists()) {
                $this->accountService->createReceivableAccountForOutlet($owner->id, $outlet->id, $outlet->name);
            }
            if (!Account::where('outlet_id', $outlet->id)->where('account_role', 'loan')->exists()) {
                $this->accountService->createLoanAccountForOutlet($owner->id, $outlet->id, $outlet->name);
            }
            if (!Account::where('outlet_id', $outlet->id)->where('account_role', 'fine')->exists()) {
                $this->accountService->createFineAccountForOutlet($owner->id, $outlet->id, $outlet->name);
            }

            $this->command->info('Step 4: Setting up operational days...');
            foreach (array_keys(OperationalDay::DAYS_OF_WEEK) as $day) {
                OperationalDay::firstOrCreate(
                    ['outlet_id' => $outlet->id, 'day_of_week' => $day],
                    ['open_time' => '07:00:00', 'close_time' => '21:00:00', 'is_open' => true]
                );
            }

            $this->command->info('Step 5: Creating units...');
            $units = [
                ['name' => 'Kilogram', 'symbol' => 'kg', 'description' => 'Satuan berat dalam kilogram'],
                ['name' => 'Pieces',   'symbol' => 'pcs', 'description' => 'Satuan per potong'],
                ['name' => 'Meter',    'symbol' => 'm', 'description' => 'Satuan panjang dalam meter'],
            ];
            foreach ($units as $u) {
                Unit::firstOrCreate(['symbol' => $u['symbol']], $u);
            }

            $this->command->info('Step 6: Configuring positions and permissions...');
            $positionSlugs = [
                ['slug' => 'kasir',    'name' => 'Kasir',    'is_default' => true],
                ['slug' => 'produksi', 'name' => 'Produksi', 'is_default' => false],
                ['slug' => 'kurir',    'name' => 'Kurir',    'is_default' => false],
            ];

            $positions = [];
            foreach ($positionSlugs as $posData) {
                $position = Position::updateOrCreate(
                    ['outlet_id' => $outlet->id, 'slug' => $posData['slug']],
                    [
                        'name'       => $posData['name'],
                        'is_default' => $posData['is_default'],
                        'is_active'  => true,
                    ]
                );

                $permissionKeys = Permission::defaultForSlug($posData['slug']);
                foreach ($permissionKeys as $key) {
                    PositionPermission::firstOrCreate(
                        ['position_id' => $position->id, 'permission_key' => $key]
                    );
                }

                $positions[$posData['slug']] = $position;
            }

            $this->command->info('Step 7: Creating reviewer employee account...');
            $employee = Employee::firstOrCreate(
                ['username' => 'googleplay.reviewer'],
                [
                    'outlet_id'  => $outlet->id,
                    'name'       => 'Google Play Reviewer',
                    'password'   => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2024')),
                    'pin_hash'   => Hash::make('112233'),
                    'pin_set_at' => now(),
                    'phone'      => '081100009002',
                    'is_active'  => true,
                    'start_date' => now()->toDateString(),
                ]
            );

            $employee->update([
                'outlet_id' => $outlet->id,
                'is_active' => true,
            ]);

            $this->command->info('Step 8: Mapping employee to roles & processes...');
            foreach (['kasir', 'produksi', 'kurir'] as $slug) {
                $position = $positions[$slug];
                EmployeePosition::updateOrCreate(
                    ['employee_id' => $employee->id, 'position_id' => $position->id],
                    ['is_active' => true]
                );
            }

            $processesData = [
                [
                    'name' => 'Pencucian',
                    'description' => 'Proses pencucian pakaian menggunakan mesin cuci dengan deterjen yang sesuai dengan jenis kain.',
                    'is_active' => true,
                ],
                [
                    'name' => 'Pengeringan',
                    'description' => 'Proses pengeringan pakaian yang telah dicuci menggunakan mesin pengering atau dijemur hingga kering.',
                    'is_active' => true,
                ],
                [
                    'name' => 'Penyetrikaan',
                    'description' => 'Proses merapikan dan menghaluskan pakaian menggunakan setrika agar tampak rapi dan bebas kusut.',
                    'is_active' => true,
                ],
                [
                    'name' => 'Pelipatan',
                    'description' => 'Proses melipat pakaian yang telah disetrika dengan rapi sesuai standar laundry.',
                    'is_active' => true,
                ],
                [
                    'name' => 'Pemeriksaan Kualitas',
                    'description' => 'Proses pemeriksaan akhir untuk memastikan semua pakaian telah dicuci, disetrika, dan dilipat dengan baik.',
                    'is_active' => true,
                ],
                [
                    'name' => 'Siap Diambil',
                    'description' => 'Pakaian telah siap dan dikemas untuk diambil oleh pelanggan.',
                    'is_active' => true,
                ],
            ];

            foreach ($processesData as $pData) {
                Process::updateOrCreate(
                    ['name' => $pData['name']],
                    [
                        'description' => $pData['description'],
                        'is_active' => $pData['is_active'],
                    ]
                );
            }

            $processes = Process::all();
            foreach ($processes as $process) {
                EmployeeProcess::firstOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'process_id'  => $process->id,
                    ],
                    [
                        'is_active'   => true,
                        'assigned_at' => now(),
                    ]
                );
            }

            $this->command->info('Step 9: Creating reviewer customer account...');
            $customerAccount = CustomerAccount::firstOrCreate(
                ['phone' => '081100009001'],
                [
                    'name'            => 'Google Play Reviewer Customer',
                    'email'           => 'googleplay.customer@washwallet.test',
                    'password'        => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2024')),
                    'is_verified'     => true,
                    'is_active'       => true,
                    'deposit_balance' => 150000,
                ]
            );

            $customerAccount->update([
                'is_verified' => true,
                'is_active'   => true,
            ]);

            $this->command->info('Step 10: Creating customer relation...');
            $customer = Customer::firstOrCreate(
                ['outlet_id' => $outlet->id, 'customer_account_id' => $customerAccount->id],
                [
                    'name'      => 'Google Play Reviewer Customer',
                    'phone'     => '081100009001',
                    'email'     => 'googleplay.customer@washwallet.test',
                    'is_active' => true,
                ]
            );

            $this->command->info('Step 11: Setting up customer addresses...');
            CustomerAddress::firstOrCreate(
                ['customer_account_id' => $customerAccount->id, 'is_primary' => true],
                [
                    'label'           => 'Rumah Demo',
                    'recipient_name'  => 'Google Play Reviewer',
                    'recipient_phone' => '081100009001',
                    'street'          => 'Jl. Demo WashWallet No. 100',
                    'province_name'   => 'DKI Jakarta',
                    'regency_name'    => 'Jakarta Selatan',
                    'district_name'   => 'Kebayoran Baru',
                    'village_name'    => 'Senayan',
                    'latitude'        => -6.2300,
                    'longitude'       => 106.8085,
                    'is_primary'      => true,
                ]
            );

            $this->command->info('Step 12: Configuring categories and laundry services...');
            $categories = [
                ['name' => 'Pakaian', 'slug' => 'gpreview-pakaian'],
                ['name' => 'Sepatu',  'slug' => 'gpreview-sepatu'],
                ['name' => 'Karpet',  'slug' => 'gpreview-karpet'],
            ];

            $categoryMap = [];
            foreach ($categories as $catData) {
                $categoryMap[$catData['slug']] = Category::firstOrCreate(
                    ['outlet_id' => $outlet->id, 'slug' => $catData['slug']],
                    ['name' => $catData['name'], 'is_active' => true]
                );
            }

            $kgUnit = Unit::where('symbol', 'kg')->first();
            $pcsUnit = Unit::where('symbol', 'pcs')->first();
            $mUnit = Unit::where('symbol', 'm')->first();

            $servicesData = [
                [
                    'category_slug' => 'gpreview-pakaian',
                    'unit_id' => $kgUnit?->id,
                    'name' => 'Cuci Reguler',
                    'slug' => 'gpreview-cuci-reguler',
                    'description' => 'Cuci pakaian reguler',
                    'price' => 8000,
                    'supports_courier' => true,
                    'duration_hours' => 48,
                    'min_quantity' => 1,
                ],
                [
                    'category_slug' => 'gpreview-pakaian',
                    'unit_id' => $kgUnit?->id,
                    'name' => 'Cuci Express',
                    'slug' => 'gpreview-cuci-express',
                    'description' => 'Cuci pakaian express cepat selesai',
                    'price' => 15000,
                    'supports_courier' => true,
                    'duration_hours' => 24,
                    'min_quantity' => 1,
                ],
                [
                    'category_slug' => 'gpreview-sepatu',
                    'unit_id' => $pcsUnit?->id,
                    'name' => 'Cuci Sepatu',
                    'slug' => 'gpreview-cuci-sepatu',
                    'description' => 'Cuci dan treatment sepatu',
                    'price' => 25000,
                    'supports_courier' => false,
                    'duration_hours' => 72,
                    'min_quantity' => 1,
                ],
                [
                    'category_slug' => 'gpreview-karpet',
                    'unit_id' => $mUnit?->id,
                    'name' => 'Cuci Karpet',
                    'slug' => 'gpreview-cuci-karpet',
                    'description' => 'Cuci karpet per meter persegi',
                    'price' => 20000,
                    'supports_courier' => false,
                    'duration_hours' => 72,
                    'min_quantity' => 1,
                ],
            ];

            $services = [];
            foreach ($servicesData as $sData) {
                $category = $categoryMap[$sData['category_slug']];
                $service = LaundryService::firstOrCreate(
                    ['slug' => $sData['slug']],
                    [
                        'category_id'      => $category->id,
                        'unit_id'          => $sData['unit_id'],
                        'name'             => $sData['name'],
                        'description'      => $sData['description'],
                        'price'            => $sData['price'],
                        'supports_courier' => $sData['supports_courier'],
                        'duration_hours'   => $sData['duration_hours'],
                        'min_quantity'     => $sData['min_quantity'],
                        'is_active'        => true,
                    ]
                );

                $processSequence = [
                    'Pencucian',
                    'Pengeringan',
                    'Penyetrikaan',
                    'Pelipatan',
                    'Pemeriksaan Kualitas',
                    'Siap Diambil'
                ];

                foreach ($processSequence as $index => $processName) {
                    $process = Process::where('name', $processName)->first();
                    if ($process) {
                        LaundryServiceProcess::firstOrCreate([
                            'laundry_service_id' => $service->id,
                            'process_id'         => $process->id,
                        ], [
                            'sequence'           => $index + 1,
                        ]);
                    }
                }

                $services[$sData['slug']] = $service;
            }

            $this->command->info('Step 13: Creating dummy cashier customers...');
            $dummyCustomers = [
                ['name' => 'Budi Demo', 'phone' => '081100009010'],
                ['name' => 'Ani Demo',  'phone' => '081100009011'],
            ];

            foreach ($dummyCustomers as $dc) {
                Customer::firstOrCreate(
                    ['outlet_id' => $outlet->id, 'phone' => $dc['phone']],
                    array_merge($dc, ['is_active' => true])
                );
            }

            $this->command->info('Step 14: Generating orders in multiple statuses...');
            $ordersData = [
                [
                    'order_number'        => 'GPREVIEW-REQUESTED',
                    'status'              => Order::STATUS_REQUESTED,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cod',
                ],
                [
                    'order_number'        => 'GPREVIEW-ACCEPTED',
                    'status'              => Order::STATUS_ACCEPTED,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cod',
                ],
                [
                    'order_number'        => 'GPREVIEW-RECEIVED',
                    'status'              => Order::STATUS_RECEIVED,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cash',
                ],
                [
                    'order_number'        => 'GPREVIEW-WEIGHING',
                    'status'              => Order::STATUS_WEIGHING,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cash',
                ],
                [
                    'order_number'        => 'GPREVIEW-READY-PROCESS',
                    'status'              => Order::STATUS_READY_TO_PROCESS,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => null,
                    'payment_method'      => null,
                ],
                [
                    'order_number'        => 'GPREVIEW-IN-PROGRESS',
                    'status'              => Order::STATUS_IN_PROGRESS,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => null,
                    'payment_method'      => null,
                ],
                [
                    'order_number'        => 'GPREVIEW-READY',
                    'status'              => Order::STATUS_READY,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cash',
                ],
                [
                    'order_number'        => 'GPREVIEW-DELIVERING',
                    'status'              => Order::STATUS_DELIVERING,
                    'payment_status'      => Order::PAYMENT_STATUS_PARTIAL,
                    'delivery_type'       => Order::DELIVERY_TYPE_DELIVERY,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cod',
                ],
                [
                    'order_number'        => 'GPREVIEW-COMPLETED',
                    'status'              => Order::STATUS_COMPLETED,
                    'payment_status'      => Order::PAYMENT_STATUS_PAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => $customerAccount->id,
                    'payment_method'      => 'cash',
                ],
                [
                    'order_number'        => 'GPREVIEW-CANCELLED',
                    'status'              => Order::STATUS_CANCELLED,
                    'payment_status'      => Order::PAYMENT_STATUS_UNPAID,
                    'delivery_type'       => Order::DELIVERY_TYPE_PICKUP,
                    'customer_account_id' => null,
                    'payment_method'      => null,
                ],
            ];

            $cuciRegulerService = $services['gpreview-cuci-reguler'];

            foreach ($ordersData as $od) {
                $custId = null;
                if ($od['customer_account_id'] !== null) {
                    $custId = $customer->id;
                } else {
                    $dummyCust = Customer::where('outlet_id', $outlet->id)->where('phone', '081100009010')->first();
                    $custId = $dummyCust?->id;
                }

                $orderDate = now()->subDays(fake()->numberBetween(1, 10));
                $estimatedCompletion = $orderDate->copy()->addDays(2);
                $actualCompletion = null;
                $pickupDate = null;

                if (in_array($od['status'], [Order::STATUS_READY, Order::STATUS_DELIVERING, Order::STATUS_COMPLETED])) {
                    $actualCompletion = $orderDate->copy()->addDays(1);
                }
                if ($od['status'] === Order::STATUS_COMPLETED) {
                    $pickupDate = $actualCompletion?->copy()->addHours(2);
                }

                $order = Order::firstOrCreate(
                    ['order_number' => $od['order_number']],
                    [
                        'outlet_id'            => $outlet->id,
                        'employee_id'          => $employee->id,
                        'customer_id'          => $custId,
                        'status'               => $od['status'],
                        'payment_status'       => $od['payment_status'],
                        'delivery_type'        => $od['delivery_type'],
                        'payment_method'       => $od['payment_method'],
                        'order_date'           => $orderDate,
                        'estimated_completion' => $estimatedCompletion,
                        'actual_completion'    => $actualCompletion,
                        'pickup_date'          => $pickupDate,
                        'source'               => $od['customer_account_id'] !== null ? 'customer_app' : 'cashier',
                        'subtotal'             => 16000,
                        'discount_amount'      => 0,
                        'tax_amount'           => 1600,
                        'total_amount'         => 17600,
                        'paid_amount'          => $od['payment_status'] === Order::PAYMENT_STATUS_PAID ? 17600 : ($od['payment_status'] === Order::PAYMENT_STATUS_PARTIAL ? 8800 : 0),
                        'remaining_amount'     => $od['payment_status'] === Order::PAYMENT_STATUS_PAID ? 0 : ($od['payment_status'] === Order::PAYMENT_STATUS_PARTIAL ? 8800 : 17600),
                        'last_status_update'   => now(),
                        'updated_by'           => $employee->id,
                    ]
                );

                if ($order->orderItems()->count() === 0) {
                    $orderItem = $order->orderItems()->create([
                        'laundry_service_id'   => $cuciRegulerService->id,
                        'category_name'        => 'Pakaian',
                        'laundry_service_name' => 'Cuci Reguler',
                        'unit_name'            => 'kg',
                        'quantity'             => 2,
                        'unit_price'           => 8000,
                        'subtotal'             => 16000,
                        'total_amount'         => 16000,
                        'status'               => in_array($od['status'], [Order::STATUS_READY, Order::STATUS_DELIVERING, Order::STATUS_COMPLETED]) ? OrderItem::STATUS_DONE : (in_array($od['status'], [Order::STATUS_IN_PROGRESS]) ? OrderItem::STATUS_PROCESSING : OrderItem::STATUS_PENDING),
                    ]);

                    $this->createProcessProgressForOrderItem($orderItem, $od['status'], $employee);
                }
            }

            $this->command->info('Step 15: Configuring courier schedules...');
            $courierSetting = CourierSetting::firstOrCreate(
                ['outlet_id' => $outlet->id],
                [
                    'is_courier_enabled'                  => true,
                    'pricing_method'                      => 'flat',
                    'flat_fee'                            => 5000,
                    'base_fee'                            => 0,
                    'per_km_fee'                          => 0,
                    'default_price'                       => 5000,
                    'free_radius_km'                      => 0,
                    'min_fee'                             => 0,
                    'max_fee'                             => 100000,
                    'max_distance_km'                     => 25,
                    'surge_enabled'                       => false,
                    'free_shipping_enabled'               => false,
                    'unconditional_free_shipping_enabled' => false,
                    'pickup_fee'                          => 0,
                    'delivery_fee'                        => 0,
                ]
            );

            $scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            foreach ($scheduleDays as $day) {
                $opDay = OperationalDay::where('outlet_id', $outlet->id)
                    ->where('day_of_week', $day)
                    ->first();

                CourierSchedule::firstOrCreate(
                    [
                        'outlet_id'   => $outlet->id,
                        'day_of_week' => $day,
                        'type'        => 'pickup',
                    ],
                    [
                        'operational_day_id' => $opDay?->id,
                        'start_time'         => '08:00',
                        'end_time'           => '12:00',
                        'is_active'          => true,
                    ]
                );

                CourierSchedule::firstOrCreate(
                    [
                        'outlet_id'   => $outlet->id,
                        'day_of_week' => $day,
                        'type'        => 'delivery',
                    ],
                    [
                        'operational_day_id' => $opDay?->id,
                        'start_time'         => '13:00',
                        'end_time'           => '17:00',
                        'is_active'          => true,
                    ]
                );
            }

            DB::commit();
            $this->command->info('✅ GooglePlayReviewerSeeder completed successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('GooglePlayReviewerSeeder failed: ' . $e->getMessage());
            $this->command->error('❌ GooglePlayReviewerSeeder failed: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function createProcessProgressForOrderItem(OrderItem $orderItem, string $orderStatus, Employee $produksi): void
    {
        $completedStatuses = [
            Order::STATUS_READY,
            Order::STATUS_DELIVERING,
            Order::STATUS_COMPLETED,
        ];

        $inProgressStatuses = [
            Order::STATUS_IN_PROGRESS,
        ];

        $serviceProcesses = LaundryServiceProcess::where('laundry_service_id', $orderItem->laundry_service_id)
            ->orderBy('sequence')
            ->get();

        if ($serviceProcesses->isEmpty()) {
            return;
        }

        if (in_array($orderStatus, $completedStatuses)) {
            foreach ($serviceProcesses as $serviceProcess) {
                try {
                    $oip = OrderItemProcess::firstOrCreate([
                        'order_item_id'              => $orderItem->id,
                        'laundry_service_process_id' => $serviceProcess->id,
                    ], [
                        'qty_processed'              => 0,
                    ]);
                    $oip->start($produksi->id);
                    $qty = (float) $orderItem->quantity;
                    $oip->complete($qty, $produksi->id);
                } catch (\Exception $e) {
                    Log::warning('Error seeding completed process progress: ' . $e->getMessage());
                }
            }
            return;
        }

        if (in_array($orderStatus, $inProgressStatuses)) {
            $halfway = (int) ceil($serviceProcesses->count() / 2);
            foreach ($serviceProcesses->take($halfway) as $index => $serviceProcess) {
                try {
                    $oip = OrderItemProcess::firstOrCreate([
                        'order_item_id'              => $orderItem->id,
                        'laundry_service_process_id' => $serviceProcess->id,
                    ], [
                        'qty_processed'              => 0,
                    ]);
                    $oip->start($produksi->id);
                    if ($index < $halfway - 1) {
                        $qty = (float) $orderItem->quantity;
                        $oip->complete($qty, $produksi->id);
                    }
                } catch (\Exception $e) {
                    Log::warning('Error seeding in_progress process progress: ' . $e->getMessage());
                }
            }
        }
    }
}
