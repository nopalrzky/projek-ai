<?php

use App\Http\Controllers\Web\AboutController;
use App\Http\Controllers\Web\AccountController;
use App\Http\Controllers\Web\AccountingPeriodController;
use App\Http\Controllers\Web\AffiliateController;
use App\Http\Controllers\Web\BalanceSheetController;
use App\Http\Controllers\Web\CategoryController;
use App\Http\Controllers\Web\CoinTransactionController;
use App\Http\Controllers\Web\CustomerController;
use App\Http\Controllers\Web\CustomerSubscriptionController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DepositController;
use App\Http\Controllers\Web\EmployeeController;
use App\Http\Controllers\Web\ExpenseController;
use App\Http\Controllers\Web\FaqController;
use App\Http\Controllers\Web\FeatureController;
use App\Http\Controllers\Web\FineController;
use App\Http\Controllers\Web\FineLogController;
use App\Http\Controllers\Web\GeneralLedgerController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\LegalController;
use App\Http\Controllers\Web\JournalEntryController;
use App\Http\Controllers\Web\LaundryServiceController;
use App\Http\Controllers\Web\LoanController;
use App\Http\Controllers\Web\MembershipContractController;
use App\Http\Controllers\Web\MembershipPlanController;
use App\Http\Controllers\Web\OutletController;
use App\Http\Controllers\Web\OutletSettingController;
use App\Http\Controllers\Web\OrderController;
use App\Http\Controllers\Web\PayrollController;
use App\Http\Controllers\Web\PettyCashController;
use App\Http\Controllers\Web\PositionController;
use App\Http\Controllers\Web\PriveController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\ProfitLossController;
use App\Http\Controllers\Web\SalaryController;
use App\Http\Controllers\Web\ServicePackageController;
use App\Http\Controllers\Web\SettingController;
use App\Http\Controllers\Web\TopupController;
use App\Http\Controllers\Web\UnitController;
use App\Http\Controllers\Web\OutletFeatureController;
use App\Http\Controllers\Web\FeatureCatalogController;
use App\Http\Controllers\Web\NotificationController;
use App\Http\Controllers\Web\WalletController;
use App\Http\Controllers\Web\OwnerBankAccountController;
use App\Http\Controllers\Web\WalletWithdrawalController;
use App\Http\Controllers\Web\Admin\WithdrawalBankController as AdminWithdrawalBankController;
use App\Http\Controllers\Web\Admin\AdminWalletWithdrawalController;
use App\Http\Controllers\Import\CategoryImportController;
use App\Http\Controllers\Import\CustomerImportController;
use App\Http\Controllers\Import\LaundryServiceImportController;
use App\Http\Controllers\Import\OutletImportController;

use App\Http\Controllers\Api\AccountController as ApiAccountController;
use App\Http\Controllers\Api\CategoryController as ApiCategoryController;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Http\Controllers\Api\EmployeeController as ApiEmployeeController;
use App\Http\Controllers\Api\FineController as ApiFineController;
use App\Http\Controllers\Api\LaundryServiceController as ApiLaundryServiceController;
use App\Http\Controllers\Api\MembershipPlanController as ApiMembershipPlanController;
use App\Http\Controllers\Api\PositionController as ApiPositionController;
use App\Http\Controllers\Api\PayrollController as ApiPayrollController;
use App\Http\Controllers\Api\ServicePackageController as ApiServicePackageController;
use App\Http\Controllers\Api\PermissionCatalogController as ApiPermissionCatalogController;

use Illuminate\Support\Facades\Route;


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::prefix('features')->controller(FeatureController::class)->name('features.')->group(function () {
    Route::get('/affiliate-program', 'affiliateProgram')
        ->name('affiliate-program');
    Route::get('/operational-management', 'operationalManagement')
        ->name('operational-management');
    Route::get('/coin-system', 'coinSystem')
        ->name('coin-system');
    Route::get('/financial-accounting', 'financialAccounting')
        ->name('financial-accounting');
    Route::get('/hr-payroll', 'hrPayroll')
        ->name('hr-payroll');
    Route::get('/membership', 'membership')
        ->name('membership');
});

Route::get('/faq', [FaqController::class, 'index'])->name('faq');

Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/account-deletion', [LegalController::class, 'accountDeletion'])->name('account-deletion');

Route::prefix('legal')->name('legal.')->controller(LegalController::class)->group(function () {
    Route::get('/privacy', 'privacy')->name('privacy');
    Route::get('/terms', 'terms')->name('terms');
    Route::get('/account-deletion', 'accountDeletion')->name('account-deletion');
});

Route::prefix('dashboard')->group(function () {
    Route::controller(DashboardController::class)->group(function () {
        Route::get('/', 'index')->name('dashboard');
        Route::get('/assets/{slug}', 'showAsset')->name('dashboard.asset.show');
    });

    Route::prefix('affiliates')->name('affiliates.')->controller(AffiliateController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::prefix('categories/{categoryId}')->name('categories.')
        ->controller(CategoryController::class)->group(function () {
            Route::prefix('laundry-services')->name('laundry-services.')->group(function () {
                Route::get('/create', 'createLaundryService')->name('create');
                Route::post('/', 'storeLaundryService')->name('store');
                Route::get('/{laundryServiceId}/edit', 'editLaundryService')->name('edit')->whereNumber('laundryServiceId');
                Route::put('/{laundryServiceId}', 'updateLaundryService')->name('update')->whereNumber('laundryServiceId');
                Route::delete('/{laundryServiceId}', 'destroyLaundryService')->name('destroy')->whereNumber('laundryServiceId');

                Route::prefix('import')->name('import.')->controller(LaundryServiceImportController::class)->group(function () {
                    Route::get('/', 'create')->name('create');
                    Route::get('/template', 'downloadTemplate')->name('template');
                    Route::post('/upload', 'upload')->name('upload');
                    Route::post('/confirm', 'confirm')->name('confirm');
                    Route::get('/result/{importId}', 'result')->name('result')->whereNumber('importId');
                    Route::get('/status/{importId}', 'status')->name('status')->whereNumber('importId');
                    Route::delete('/cancel/{importId}', 'cancel')->name('cancel')->whereNumber('importId');
                });
            });
        })->whereNumber('categoryId');

    Route::prefix('coin-transactions')->name('coin-transactions.')->controller(CoinTransactionController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{coinTransactionId}', 'show')->name('show')->whereNumber('coinTransactionId');
    });

    Route::prefix('customers/{customerId}')->name('customers.')
        ->controller(CustomerController::class)->group(function () {
            Route::prefix('membership-contracts')->name('membership-contracts.')->group(function () {
                Route::get('/create', 'createMembershipContract')->name('create');
                Route::post('/', 'storeMembershipContract')->name('store');
                Route::get('/{membershipContractId}/edit', 'editMembershipContract')->name('edit')->whereNumber('membershipContractId');
                Route::put('/{membershipContractId}', 'updateMembershipContract')->name('update')->whereNumber('membershipContractId');
                Route::delete('/{membershipContractId}', 'destroyMembershipContract')->name('destroy')->whereNumber('membershipContractId');
            });

            Route::prefix('customer-subscriptions')->name('customer-subscriptions.')->group(function () {
                Route::get('/create', 'createCustomerSubscription')->name('create');
                Route::post('/', 'storeCustomerSubscription')->name('store');
                Route::get('/{customerSubscriptionId}', 'showCustomerSubscription')->name('show')->whereNumber('customerSubscriptionId');
                Route::get('/{customerSubscriptionId}/edit', 'editCustomerSubscription')->name('edit')->whereNumber('customerSubscriptionId');
                Route::put('/{customerSubscriptionId}', 'updateCustomerSubscription')->name('update')->whereNumber('customerSubscriptionId');
                Route::delete('/{customerSubscriptionId}', 'destroyCustomerSubscription')->name('destroy')->whereNumber('customerSubscriptionId');
            });
        })->whereNumber('customerId');

    Route::prefix('employees/{employeeId}')->name('employees.')->controller(EmployeeController::class)->group(function () {
        Route::prefix('employeeProcesses')->name('employee-processes.')->group(function () {
            Route::get('/create', 'createEmployeeProcess')->name('create');
            Route::post('/', 'storeEmployeeProcess')->name('store');
            Route::get('/setting', 'settingEmployeeProcess')->name('setting');
            Route::post('/sync', 'syncEmployeeProcesses')->name('sync');
            Route::get('/{employeeProcessId}/edit', 'editEmployeeProcess')->name('edit')->whereNumber('employeeProcessId');
            Route::put('/{employeeProcessId}', 'updateEmployeeProcess')->name('update')->whereNumber('employeeProcessId');
            Route::delete('/{employeeProcessId}', 'destroyEmployeeProcess')->name('destroy')->whereNumber('employeeProcessId');
        });

        Route::prefix('employeePositions')->name('employee-positions.')->group(function () {
            Route::post('/', 'storeEmployeePosition')->name('store');
            Route::put('/{employeePositionId}', 'updateEmployeePosition')->name('update')->whereNumber('employeePositionId');
            Route::delete('/{employeePositionId}', 'destroyEmployeePosition')->name('destroy')->whereNumber('employeePositionId');
        });

        Route::prefix('employeeSalaries')->name('employee-salaries.')->group(function () {
            Route::get('/create', 'createEmployeeSalary')->name('create');
            Route::post('/', 'storeEmployeeSalary')->name('store');
            Route::get('/{employeeSalaryId}/edit', 'editEmployeeSalary')->name('edit')->whereNumber('employeeSalaryId');
            Route::put('/{employeeSalaryId}', 'updateEmployeeSalary')->name('update')->whereNumber('employeeSalaryId');
            Route::delete('/{employeeSalaryId}', 'destroyEmployeeSalary')->name('destroy')->whereNumber('employeeSalaryId');
        });

        Route::prefix('loans')->name('loans.')->group(function () {
            Route::get('/create', 'createLoan')->name('create');
            Route::post('/', 'storeLoan')->name('store');
            Route::get('/{loanId}/edit', 'editLoan')->name('edit')->whereNumber('loanId');
            Route::put('/{loanId}', 'updateLoan')->name('update')->whereNumber('loanId');
            Route::delete('/{loanId}', 'destroyLoan')->name('destroy')->whereNumber('loanId');
        });
    })->whereNumber('employeeId');

    Route::prefix('outlets')->group(function () {
        Route::prefix('import')->name('outlets.import.')->controller(OutletImportController::class)->group(function () {
            Route::get('/', 'index')
                ->name('index');
            Route::get('/template', 'downloadTemplate')
                ->name('template');
            Route::post('', 'upload')
                ->name('upload');
            Route::get('/preview', 'preview')
                ->name('preview');
            Route::post('/confirm', 'confirm')
                ->name('confirm');
            Route::get('/result/{importId}', 'result')
                ->name('result')->whereNumber('importId');
            Route::get('/status/{importId}', 'status')
                ->name('status')->whereNumber('importId');
        });

        Route::prefix('{outletId}')->controller(OutletController::class)
            ->name('outlets.')->group(function () {
                Route::get('/activate', 'activatePage')->name('activate.page');
                Route::post('/activate', 'activate')->name('activate');
                // Route::post('/start-trial', 'startTrial')->name('start-trial');

                Route::prefix('categories')->name('categories.')->group(function () {
                    Route::get('/create', 'createCategory')->name('create');
                    Route::post('/', 'store')->name('store');
                    Route::get('/{categoryId}/edit', 'editCategory')->name('edit')->whereNumber('categoryId');
                    Route::put('/{categoryId}', 'updateCategory')->name('update')->whereNumber('categoryId');
                    Route::delete('/{categoryId}', 'destroyCategory')->name('destroy')->whereNumber('categoryId');


                    Route::prefix('import')->name('import.')->controller(CategoryImportController::class)->group(function () {
                        Route::get('/', 'create')->name('create');
                        Route::get('/template', 'downloadTemplate')->name('template');
                        Route::post('/upload', 'upload')->name('upload');
                        Route::post('/confirm', 'confirm')->name('confirm');
                        Route::get('/result/{importId}', 'result')->name('result')->whereNumber('importId');
                        Route::get('/status/{importId}', 'status')->name('status')->whereNumber('importId');
                        Route::delete('/cancel/{importId}', 'cancel')->name('cancel')->whereNumber('importId');
                    });
                });

                Route::prefix('/courier-schedules')->name('courier-schedules.')->group(function () {
                    Route::post('/', 'storeCourierSchedule')->name('store');
                    Route::put('/{scheduleId}', 'updateCourierSchedule')->name('update')->whereNumber('scheduleId');
                    Route::delete('/{scheduleId}', 'destroyCourierSchedule')->name('destroy')->whereNumber('scheduleId');
                });

                Route::prefix('courier-settings')->name('courier-settings.')->group(function () {
                    Route::put('/', 'updateCourierSetting')->name('update');
                    Route::get('/zone-options', 'getZoneLocationOptions')->name('zone-options');
                    Route::get('/zone-options/villages/{districtId}', 'getZoneVillageOptions')->name('zone-village-options')->whereNumber('districtId');
                });

                Route::prefix('/customers')->name('customers.')->group(function () {
                    Route::get('/create', 'createCustomer')->name('create');
                    Route::post('/', 'storeCustomer')->name('store');
                    Route::get('/{customerId}/edit', 'editCustomer')->name('edit')->whereNumber('customerId');
                    Route::put('/{customerId}', 'updateCustomer')->name('update')->whereNumber('customerId');
                    Route::delete('/{customerId}', 'destroyCustomer')->name('destroy')->whereNumber('customerId');

                    Route::prefix('import')->name('import.')->controller(CustomerImportController::class)->group(function () {
                        Route::get('/', 'create')->name('create');
                        Route::get('/template', 'downloadTemplate')->name('template');
                        Route::post('/upload', 'upload')->name('upload');
                        Route::post('/confirm', 'confirm')->name('confirm');
                        Route::get('/result/{importId}', 'result')->name('result')->whereNumber('importId');
                        Route::get('/status/{importId}', 'status')->name('status')->whereNumber('importId');
                        Route::delete('/cancel/{importId}', 'cancel')->name('cancel')->whereNumber('importId');
                    });
                });

                Route::prefix('/employees')->name('employees.')->group(function () {
                    Route::get('/create', 'createEmployee')->name('create');
                    Route::post('/', 'storeEmployee')->name('store');
                    Route::get('/{employeeId}/edit', 'editEmployee')->name('edit')->whereNumber('employeeId');
                    Route::put('/{employeeId}', 'updateEmployee')->name('update')->whereNumber('employeeId');
                    Route::delete('/{employeeId}', 'destroyEmployee')->name('destroy')->whereNumber('employeeId');
                });

                Route::prefix('/fines')->name('fines.')->group(function () {
                    Route::get('/create', 'createFine')->name('create');
                    Route::post('/', 'storeFine')->name('store');
                    Route::get('/{fineId}/edit', 'editFine')->name('edit')->whereNumber('fineId');
                    Route::put('/{fineId}', 'updateFine')->name('update')->whereNumber('fineId');
                    Route::delete('/{fineId}', 'destroyFine')->name('destroy')->whereNumber('fineId');
                });

                Route::prefix('/laundry-services')->name('laundry-services.')->group(function () {
                    Route::get('/create', 'createLaundryService')->name('create');
                    Route::post('/', 'storeLaundryService')->name('store');
                    Route::patch('/bulk-courier-eligibility', 'bulkUpdateLaundryServiceCourierEligibility')->name('bulk-courier-eligibility');
                    Route::patch('/{laundryServiceId}/courier-eligibility', 'updateLaundryServiceCourierEligibility')->name('courier-eligibility')->whereNumber('laundryServiceId');
                    Route::get('/{laundryServiceId}', 'showLaundryService')->name('show')->whereNumber('laundryServiceId');
                    Route::get('/{laundryServiceId}/edit', 'editLaundryService')->name('edit')->whereNumber('laundryServiceId');
                    Route::put('/{laundryServiceId}', 'updateLaundryService')->name('update')->whereNumber('laundryServiceId');
                    Route::delete('/{laundryServiceId}', 'destroyLaundryService')->name('destroy')->whereNumber('laundryServiceId');
                });

                Route::prefix('/membership-plans')->name('membership-plans.')->group(function () {
                    Route::get('/create', 'createMembershipPlan')->name('create');
                    Route::post('/', 'storeMembershipPlan')->name('store');
                    Route::get('/{membershipPlanId}', 'showMembershipPlan')->name('show')->whereNumber('membershipPlanId');
                    Route::get('/{membershipPlanId}/edit', 'editMembershipPlan')->name('edit')->whereNumber('membershipPlanId');
                    Route::put('/{membershipPlanId}', 'updateMembershipPlan')->name('update')->whereNumber('membershipPlanId');
                    Route::delete('/{membershipPlanId}', 'destroyMembershipPlan')->name('destroy')->whereNumber('membershipPlanId');
                });

                Route::prefix('/operational-days')->name('operational-days.')->group(function () {
                    Route::post('/', 'storeOperationalDay')->name('store');
                    Route::put('/{operationalDayId}', 'updateOperationalDay')->name('update')->whereNumber('operationalDayId');
                    Route::delete('/{operationalDayId}', 'destroyOperationalDay')->name('destroy')->whereNumber('operationalDayId');
                });

                Route::prefix('/positions')->name('positions.')->group(function () {
                    Route::get('/create', 'createPosition')->name('create');
                    Route::post('/', 'storePosition')->name('store');
                    Route::get('/{positionId}/edit', 'editPosition')->name('edit')->whereNumber('positionId');
                    Route::put('/{positionId}', 'updatePosition')->name('update')->whereNumber('positionId');
                    Route::delete('/{positionId}', 'destroyPosition')->name('destroy')->whereNumber('positionId');
                });

                Route::prefix('/service-packages')->name('service-packages.')->group(function () {
                    Route::get('/create', 'createServicePackage')->name('create');
                    Route::post('/', 'storeServicePackage')->name('store');
                    Route::get('/{packageId}', 'showServicePackage')->name('show')->whereNumber('packageId');
                    Route::get('/{packageId}/edit', 'editServicePackage')->name('edit')->whereNumber('packageId');
                    Route::put('/{packageId}', 'updateServicePackage')->name('update')->whereNumber('packageId');
                    Route::delete('/{packageId}', 'destroyServicePackage')->name('destroy')->whereNumber('packageId');
                });

                Route::prefix('/features')->name('features.')->group(function () {
                    Route::get('/create', [OutletController::class, 'createOutletFeature'])->name('create');
                    Route::post('/', [OutletController::class, 'storeOutletFeature'])->name('store');
                    Route::post('/activate-courier', [OutletController::class, 'activateCourierFeature'])->name('activate-courier');

                    Route::controller(OutletFeatureController::class)->group(function () {
                        Route::get('/', 'index')->name('index');
                        Route::post('/{featureId}/trial', 'startTrial')->name('trial')->whereNumber('featureId');
                        Route::post('/{featureId}/unlock', 'unlock')->name('unlock')->whereNumber('featureId');
                        Route::post('/activate', 'activate')->name('activate');
                        Route::post('/{featureId}/exposure', 'exposure')->name('exposure')->whereNumber('featureId');
                        Route::patch('/exposure/auto-renewal', 'toggleAutoRenewal')->name('auto-renewal');
                    });
                });

                Route::prefix('/courier-schedules')->name('courier-schedules.')->group(function () {
                    // Route::get('/create', [OutletController::class, 'createCourierSchedule'])->name('create');
                    Route::post('/', [OutletController::class, 'storeCourierSchedule'])->name('store');
                    // Route::get('/{scheduleId}/edit', [OutletController::class, 'editCourierSchedule'])->name('edit')->whereNumber('scheduleId');
                    Route::put('/{scheduleId}', [OutletController::class, 'updateCourierSchedule'])->name('update')->whereNumber('scheduleId');
                    Route::delete('/{scheduleId}', [OutletController::class, 'destroyCourierSchedule'])->name('destroy')->whereNumber('scheduleId');
                });

                Route::prefix('courier-settings')->name('courier-settings.')->group(function () {
                    Route::get('/edit', [OutletController::class, 'editCourierSetting'])->name('edit');
                    Route::put('/', [OutletController::class, 'updateCourierSetting'])->name('update');
                    Route::put('/toggle', [OutletController::class, 'toggleCourierEnabled'])->name('toggle');
                    Route::get('/zone-options', [OutletController::class, 'getZoneLocationOptions'])->name('zone-options');
                    Route::get('/zone-options/villages/{districtId}', [OutletController::class, 'getZoneVillageOptions'])->name('zone-village-options')->whereNumber('districtId');
                });

                Route::prefix('settings')->name('settings.')->controller(OutletSettingController::class)->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::put('/', 'update')->name('update');
                });
            })->whereNumber('outletId');
    });

    Route::prefix('accounting-periods')->controller(AccountingPeriodController::class)
        ->name('accounting-periods.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::post('/{id}/close', 'close')->name('close')->whereNumber('id');
            Route::post('/{id}/reopen', 'reopen')->name('reopen')->whereNumber('id');
            Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
        });

    Route::controller(GeneralLedgerController::class)->prefix('general-ledger')
        ->name('general-ledger.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/summary', 'summary')->name('summary');
            Route::get('/compare', 'compare')->name('compare');
            Route::get('/print', 'print')->name('print');
            Route::post('/export', 'export')->name('export');
        });

    Route::prefix('profit-loss')->controller(ProfitLossController::class)
        ->name('profit-loss.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/compare', 'compare')->name('compare');
            Route::get('/print', 'print')->name('print');
            Route::post('/export', 'export')->name('export');
        });

    Route::prefix('profile')->controller(ProfileController::class)
        ->name('profile.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/edit', 'edit')->name('edit');
            Route::get('/change-password', 'changePassword')->name('change-password');
            Route::put('/', 'update')->name('update');
            Route::post('/password', 'updatePassword')->name('password');
        });

    Route::prefix('balance-sheet')->controller(BalanceSheetController::class)
        ->name('balance-sheet.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/compare', 'compare')->name('compare');
            Route::get('/print', 'print')->name('print');
            Route::post('/export', 'export')->name('export');
        });


    Route::resource('accounts', AccountController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('customer-subscriptions', CustomerSubscriptionController::class);
    Route::prefix('deposits')->name('deposits.')->controller(DepositController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::post('/{id}/approve', 'approve')->name('approve')->whereNumber('id');
        Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
    });
    Route::put('employees/{employee}/password', [EmployeeController::class, 'updatePassword'])
        ->name('employees.password.update')
        ->whereNumber('employee');
    Route::resource('employees', EmployeeController::class);
    Route::prefix('expenses')->name('expenses.')->controller(ExpenseController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::get('/{id}/edit', 'edit')->name('edit')->whereNumber('id');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id');
        Route::post('/{id}/approve', 'approve')->name('approve')->whereNumber('id');
        Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
    });
    Route::resource('fine-logs', FineLogController::class);
    Route::prefix('petty-cashes')->name('petty-cashes.')->controller(PettyCashController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::post('/{id}/approve', 'approve')->name('approve')->whereNumber('id');
        Route::post('/{id}/reject', 'reject')->name('reject')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
    });
    Route::resource('fines', FineController::class);
    Route::resource('features', FeatureCatalogController::class)->except(['show']);
    Route::resource('laundry-services', LaundryServiceController::class);
    Route::prefix('laundry-services/{laundryServiceId}')
        ->name('laundry-services.')
        ->controller(LaundryServiceController::class)
        ->whereNumber('laundryServiceId')
        ->group(function () {
            Route::prefix('laundry-service-processes')
                ->name('laundry-service-processes.')
                ->group(function () {
                    Route::get('/create', 'createLaundryServiceProcess')->name('create');
                    Route::post('/', 'storeLaundryServiceProcess')->name('store');
                    Route::get('/{laundryServiceProcessId}/edit', 'editLaundryServiceProcess')
                        ->name('edit')->whereNumber('laundryServiceProcessId');
                    Route::put('/{laundryServiceProcessId}', 'updateLaundryServiceProcess')
                        ->name('update')->whereNumber('laundryServiceProcessId');
                    Route::delete('/{laundryServiceProcessId}', 'destroyLaundryServiceProcess')
                        ->name('destroy')->whereNumber('laundryServiceProcessId');
                });
        });
    Route::resource('journal-entries', JournalEntryController::class);
    Route::resource('loans', LoanController::class);
    Route::resource('membership-contracts', MembershipContractController::class);
    Route::resource('membership-plans', MembershipPlanController::class);
    Route::resource('outlets', OutletController::class);
    Route::resource('orders', OrderController::class)->only(['index', 'show', 'destroy']);
    Route::post('orders/{id}/payment', [OrderController::class, 'storePayment'])->name('orders.payment.store')->whereNumber('id');
    Route::delete('orders/{id}/payment/{paymentLogId}', [OrderController::class, 'destroyPayment'])->name('orders.payment.destroy')
        ->where(['id' => '[0-9]+', 'paymentLogId' => '[0-9]+']);
    Route::resource('positions', PositionController::class);
    Route::resource('prives', PriveController::class);
    Route::resource('service-packages', ServicePackageController::class);
    Route::resource('topups', TopupController::class)->except(['edit', 'update']);
    Route::resource('payrolls', PayrollController::class);

    Route::get('wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::resource('bank-accounts', OwnerBankAccountController::class)->except(['show']);
    Route::post('bank-accounts/{id}/set-default', [OwnerBankAccountController::class, 'setDefault'])
        ->name('bank-accounts.set-default')->whereNumber('id');

    Route::resource('wallet-withdrawals', WalletWithdrawalController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('wallet-withdrawals/{id}/cancel', [WalletWithdrawalController::class, 'cancel'])
        ->name('wallet-withdrawals.cancel')->whereNumber('id');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('withdrawal-banks', AdminWithdrawalBankController::class)->except(['show']);
        Route::get('wallet-withdrawals', [AdminWalletWithdrawalController::class, 'index'])
            ->name('wallet-withdrawals.index');
        Route::get('wallet-withdrawals/{id}', [AdminWalletWithdrawalController::class, 'show'])
            ->name('wallet-withdrawals.show')->whereNumber('id');
        Route::post('wallet-withdrawals/{id}/process', [AdminWalletWithdrawalController::class, 'process'])
            ->name('wallet-withdrawals.process')->whereNumber('id');
        Route::post('wallet-withdrawals/{id}/mark-paid', [AdminWalletWithdrawalController::class, 'markPaid'])
            ->name('wallet-withdrawals.mark-paid')->whereNumber('id');
        Route::post('wallet-withdrawals/{id}/reject', [AdminWalletWithdrawalController::class, 'reject'])
            ->name('wallet-withdrawals.reject')->whereNumber('id');
    });

    Route::resource('salaries', SalaryController::class);
    Route::resource('units', UnitController::class);
    Route::resource('settings', SettingController::class);
    Route::resource('feature-catalog', FeatureCatalogController::class)->except(['show']);

    Route::prefix('notifications')->name('notifications.')->controller(NotificationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/unread-count', 'unreadCount')->name('unread-count');
        Route::get('/recent', 'recent')->name('recent');
        Route::post('/read-all', 'markAllRead')->name('read-all');
        Route::post('/{id}/read', 'markRead')->name('read')->whereNumber('id');
        Route::get('/{id}/redirect', 'markReadAndRedirect')->name('redirect')->whereNumber('id');
    });
});

Route::prefix('api')->name('api.')->group(function () {
    Route::get('permissions/catalog', [ApiPermissionCatalogController::class, 'index'])
        ->name('permissions.catalog');

    Route::prefix('accounts')->name('accounts.')->controller(ApiAccountController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/next-code', 'getNextCode')->name('next-code');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('categories')->name('categories.')->controller(ApiCategoryController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('customers')->name('customers.')->controller(ApiCustomerController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('employees')->name('employees.')->controller(ApiEmployeeController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('fines')->name('fines.')->controller(ApiFineController::class)->group(function () {
        Route::get('/', 'getAll')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('laundry-services')->name('laundry-services.')->controller(ApiLaundryServiceController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
    });

    Route::prefix('membership-plans')->name('membership-plans.')->controller(ApiMembershipPlanController::class)->group(function () {
        Route::get('/outlet/{outletId}', 'getMembershipPlansByOutletId')->name('by-outlet')->whereNumber('outletId');
    });

    Route::prefix('positions')->name('positions.')->controller(ApiPositionController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show')->whereNumber('id');
        Route::put('/{id}', 'update')->name('update')->whereNumber('id');
        Route::delete('/{id}', 'destroy')->name('destroy')->whereNumber('id');
        Route::post('/{id}/restore', 'restore')->name('restore')->whereNumber('id');
        Route::delete('/{id}/force', 'forceDestroy')->name('force-destroy')->whereNumber('id');
        Route::get('/outlet/{outletId}', 'getPositionsByOutletId')->name('by-outlet')->whereNumber('outletId');
    });

    Route::post('payrolls/preview', [ApiPayrollController::class, 'preview'])->name('payrolls.preview');

    Route::prefix('service-packages')->name('service-packages.')->controller(ApiServicePackageController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });
});

require __DIR__ . '/auth.php';
