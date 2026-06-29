import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../../core/helpers/online_guard.dart';
import '../../../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../../../features/auth/presentation/bloc/auth_state.dart';
import '../../../account/presentation/bloc/account_cubit.dart';
import '../../../account/presentation/bloc/account_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../../customer_subscription/presentation/bloc/customer_subscription_state.dart';
import '../../../customer_subscription/presentation/bloc/customer_subscription_cubit.dart';
import '../../../membership_contract/presentation/bloc/membership_contract_cubit.dart';
import '../../../membership_contract/presentation/bloc/membership_contract_state.dart';

import '../../domain/services/order_price_calculator.dart';
import '../../domain/usecases/store_usecase.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/order_review/order_review_customer_card.dart';
import '../widgets/order_review/order_review_date_section.dart';
import '../widgets/order_review/order_review_items_list.dart';
import '../widgets/order_review/order_review_notes_field.dart';
import '../widgets/order_review/order_review_payment_section.dart';
import '../widgets/order_review/order_review_submit_button.dart';
import '../widgets/order_review/order_review_summary_section.dart';
import '../widgets/order_review/order_review_transfer_account_field.dart';
import '../widgets/order_review/order_review_context_info.dart';
import 'index_orders_screen.dart';
import 'success_order_screen.dart';

class ReviewOrderScreen extends StatefulWidget {
  final int outletId;
  final Customer customer;
  final List<OrderDraftItem> items;
  final List<LaundryService> services;
  final OrderDraft? draft;

  const ReviewOrderScreen({
    super.key,
    required this.outletId,
    required this.customer,
    required this.items,
    required this.services,
    this.draft,
  });

  @override
  State<ReviewOrderScreen> createState() => _ReviewOrderScreenState();
}

class _ReviewOrderScreenState extends State<ReviewOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _paidAmountController = TextEditingController();

  String? _paymentMethod;
  String _paymentStatus = 'unpaid';
  DateTime _estimatedDate = DateTime.now().add(const Duration(days: 1));
  Account? _selectedAccount;
  final OrderPriceCalculator _priceCalculator = const OrderPriceCalculator();
  List<MembershipContract> _membershipContracts = const [];
  List<CustomerSubscription> _customerSubscriptions = const [];
  bool _isPricingReady = false;
  late OrderPriceResult _priceResult;
  late final String _clientRequestId;

  @override
  void initState() {
    super.initState();
    _priceResult = _calculatePrice();
    _clientRequestId = widget.draft?.clientRequestId ?? IdempotencyKey.generate();

    if (widget.draft != null) {
      if (widget.draft!.notes != null) {
        _notesController.text = widget.draft!.notes!;
      }
      if (widget.draft!.paymentStatus != null) {
        _paymentStatus = widget.draft!.paymentStatus!;
      }
      if (widget.draft!.paymentMethod != null) {
        _paymentMethod = widget.draft!.paymentMethod;
      }
      if (widget.draft!.estimatedCompletion != null) {
        _estimatedDate = widget.draft!.estimatedCompletion!;
      }
      if (widget.draft!.paidAmount != null && widget.draft!.paidAmount! > 0) {
        _paidAmountController.text = widget.draft!.paidAmount!.toInt().toString();
      }
      if (widget.draft!.paymentAccountId != null && (_paymentMethod == 'transfer' || _paymentMethod == 'qris')) {
         context.read<AccountCubit>().loadTransferAccounts(widget.outletId);
      }
    }

    _loadPricingContext();
    _updatePaidAmountBasedOnStatus();

    _notesController.addListener(_saveDraftToStorage);
    _paidAmountController.addListener(_saveDraftToStorage);
  }

  @override
  void dispose() {
    _notesController.removeListener(_saveDraftToStorage);
    _paidAmountController.removeListener(_saveDraftToStorage);
    _notesController.dispose();
    _paidAmountController.dispose();
    super.dispose();
  }

  void _updatePaidAmountBasedOnStatus() {
    if (_paymentStatus == 'paid') {
      _paidAmountController.text = _priceResult.total.toInt().toString();
    } else if (_paymentStatus == 'partial') {
      _paidAmountController.clear();
    } else {
      _paidAmountController.clear();
    }
  }

  bool get _isFullyCoveredByPackage {
    return _priceCalculator.isFullyCoveredByPackage(_priceResult);
  }

  void _syncPaymentStatusWithCoverage() {
    if (_isFullyCoveredByPackage) {
      _paymentStatus = 'paid_by_package';
      _paymentMethod = null;
      _selectedAccount = null;
      _paidAmountController.clear();
      return;
    }

    if (_paymentStatus == 'paid_by_package') {
      _paymentStatus = 'unpaid';
      _paymentMethod = null;
      _selectedAccount = null;
      _paidAmountController.clear();
    }
    _saveDraftToStorage();
  }

  void _handlePaymentMethodChanged(String method) {
    setState(() {
      _paymentMethod = method;
      if ((method == 'transfer' || method == 'qris') &&
          _selectedAccount == null) {
        context.read<AccountCubit>().loadTransferAccounts(widget.outletId);
      }
      if (method != 'transfer' && method != 'qris') {
        _selectedAccount = null;
      }
    });
    _saveDraftToStorage();
  }

  void _handlePaymentStatusChanged(String status) {
    if (_isFullyCoveredByPackage) {
      return;
    }

    setState(() {
      _paymentStatus = status;

      if (status == 'unpaid') {
        _paymentMethod = null;
        _paidAmountController.clear();
        _selectedAccount = null;
      } else {
        _paymentMethod ??= 'cash';
        _updatePaidAmountBasedOnStatus();
      }
    });
    _saveDraftToStorage();
  }

  void _saveDraftToStorage() {
    final authState = context.read<AuthCubit>().state;
    if (authState is! Authenticated) return;

    final draft = OrderDraft(
      outletId: widget.outletId,
      customerId: widget.customer.id,
      employeeId: authState.employee.id,
      items: widget.items,
      notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      estimatedCompletion: _estimatedDate,
      paymentStatus: _isFullyCoveredByPackage ? 'paid_by_package' : _paymentStatus,
      paymentMethod: _paymentMethod,
      paymentAccountId: _selectedAccount?.id,
      paidAmount: double.tryParse(_paidAmountController.text) ?? 0,
      clientRequestId: _clientRequestId,
      updatedAt: DateTime.now(),
    );
    context.read<OrderCubit>().saveDraft(draft);
  }

  void _loadPricingContext() {
    context.read<MembershipContractCubit>().getAll(
      customerId: widget.customer.id,
      status: 'active',
      refresh: true,
    );
    context
        .read<CustomerSubscriptionCubit>()
        .loadCustomerSubscriptionsByCustomerId(
          customerId: widget.customer.id,
          status: 'active',
        );
  }

  OrderPriceResult _calculatePrice() {
    return _priceCalculator.calculate(
      items: widget.items,
      services: widget.services,
      membershipContracts: _membershipContracts,
      customerSubscriptions: _customerSubscriptions,
    );
  }

  void _refreshPriceResult() {
    final membershipState = context.read<MembershipContractCubit>().state;
    final subscriptionState = context.read<CustomerSubscriptionCubit>().state;
    final isStillLoading =
        membershipState is MembershipContractLoading ||
        subscriptionState is CustomerSubscriptionLoading;

    setState(() {
      _priceResult = _calculatePrice();
      _isPricingReady = !isStillLoading;
      _syncPaymentStatusWithCoverage();
      if (_paymentStatus == 'paid') {
        _paidAmountController.text = _priceResult.total.toInt().toString();
      }
    });
  }

  void _showTransferAccountPicker() {
    final accountState = context.read<AccountCubit>().state;

    if (accountState is! AccountsLoaded) {
      context.read<AccountCubit>().loadTransferAccounts(widget.outletId);
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Theme.of(context).dividerColor),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Pilih Rekening Tujuan',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: BlocBuilder<AccountCubit, AccountState>(
                  builder: (context, state) {
                    if (state is AccountLoading) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    if (state is AccountFailure) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                size: 48,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                state.failure.message,
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: () {
                                  context
                                      .read<AccountCubit>()
                                      .loadTransferAccounts(widget.outletId);
                                },
                                child: const Text('Coba Lagi'),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    if (state is AccountsLoaded) {
                      final accounts = state.accounts;

                      if (accounts.isEmpty) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Tidak ada rekening tersedia'),
                          ),
                        );
                      }

                      final currencyFormat = NumberFormat.currency(
                        locale: 'id_ID',
                        symbol: 'Rp ',
                        decimalDigits: 0,
                      );

                      return ListView.separated(
                        controller: scrollController,
                        itemCount: accounts.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final account = accounts[index];
                          return ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.blue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.account_balance,
                                color: Colors.blue,
                              ),
                            ),
                            title: Text(
                              account.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(account.code),
                            trailing: Text(
                              currencyFormat.format(account.balance),
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            onTap: () {
                              setState(() {
                                _selectedAccount = account;
                              });
                              Navigator.pop(context);
                            },
                          );
                        },
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _estimatedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked != null) {
      setState(() => _estimatedDate = picked);
      _saveDraftToStorage();
    }
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    if (_paymentStatus != 'unpaid' && _paymentStatus != 'paid_by_package') {
      final paidAmount = double.tryParse(_paidAmountController.text) ?? 0;

      if (paidAmount <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nominal pembayaran harus lebih dari 0'),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }

      if ((_paymentMethod == 'transfer' || _paymentMethod == 'qris') &&
          _selectedAccount == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Pilih rekening tujuan untuk metode ${_paymentMethod == 'transfer' ? 'Transfer' : 'QRIS'}',
            ),
            backgroundColor: Colors.orange,
          ),
        );
        return;
      }
    }

    final authState = context.read<AuthCubit>().state;
    int employeeId = 0;

    if (authState is Authenticated) {
      employeeId = authState.employee.id;
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi anda telah berakhir, silakan login ulang'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final orderItemsData = widget.items.map((item) {
      final service = widget.services.firstWhere(
        (s) => s.id == item.laundryServiceId,
      );

      final breakdown = _priceResult.itemBreakdowns.firstWhere(
        (b) => b.laundryServiceId == item.laundryServiceId,
        orElse: () => OrderItemPriceBreakdown(
          laundryServiceId: item.laundryServiceId,
          laundryServiceName: service.name,
          unitPrice: service.price,
          totalQuantity: item.quantity.toDouble(),
          quotaCoveredQuantity: 0,
          payableQuantity: item.quantity.toDouble(),
          subtotalBeforeDiscount: service.price * item.quantity,
          quotaDiscountAmount: 0,
          membershipDiscountAmount: 0,
          totalAmount: service.price * item.quantity,
        ),
      );

      int? subscriptionId;
      if (breakdown.quotaCoveredQuantity > 0) {
        for (final sub in _customerSubscriptions) {
          final hasQuota = sub.customerQuotas.any(
            (q) =>
                q.laundryServiceId == item.laundryServiceId &&
                q.remainingQuota > 0,
          );
          if (hasQuota) {
            subscriptionId = sub.id;
            break;
          }
        }
      }

      final isPackageUsage = breakdown.quotaCoveredQuantity > 0;

      return {
        'laundryServiceId': item.laundryServiceId,
        'quantity': item.quantity,
        'itemNotes': item.notes,
        'discountAmount':
            breakdown.quotaDiscountAmount + breakdown.membershipDiscountAmount,
        'isPackageUsage': isPackageUsage,
        'customerSubscriptionId': subscriptionId,
        'quotaUsed': isPackageUsage ? breakdown.quotaCoveredQuantity : null,
      };
    }).toList();

    final params = StoreParams(
      customerId: widget.customer.id,
      employeeId: employeeId,
      paymentMethod:
          (_paymentStatus == 'unpaid' || _paymentStatus == 'paid_by_package')
          ? null
          : _paymentMethod,
      paymentStatus: _isFullyCoveredByPackage
          ? 'paid_by_package'
          : _paymentStatus,
      paidAmount:
          (_paymentStatus == 'unpaid' || _paymentStatus == 'paid_by_package')
          ? 0
          : (double.tryParse(_paidAmountController.text) ?? 0),
      sourceAccountId:
          (_paymentStatus == 'unpaid' || _paymentStatus == 'paid_by_package')
          ? null
          : ((_paymentMethod == 'transfer' || _paymentMethod == 'qris')
                ? _selectedAccount?.id
                : null),
      notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      estimatedCompletion: _estimatedDate,
      orderItems: orderItemsData,
      clientRequestId: _clientRequestId,
    );

    OnlineGuard.requireOnline(
      actionName: 'Membuat Order',
      action: () async => context.read<OrderCubit>().store(params, outletId: widget.outletId),
      onOffline: (message) => AppSnackbar.error(context, message: message),
    );
  }

  bool _isSubmitEnabled() {
    if (!_isPricingReady) {
      return false;
    }

    if (_paymentStatus != 'unpaid' && _paymentStatus != 'paid_by_package') {
      if ((_paymentMethod == 'transfer' || _paymentMethod == 'qris') &&
          _selectedAccount == null) {
        return false;
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Review Pesanan',
        onBackPressed: () => Navigator.pop(context),
      ),
      bottomBar: BlocBuilder<OrderCubit, OrderState>(
        builder: (context, state) {
          return OrderReviewSubmitButton(
            isLoading: state is OrderLoading,
            onPressed: _handleSubmit,
            isEnabled: _isSubmitEnabled(),
          );
        },
      ),
      body: MultiBlocListener(
        listeners: [
          BlocListener<MembershipContractCubit, MembershipContractState>(
            listener: (context, state) {
              if (state is MembershipContractsLoaded) {
                _membershipContracts = state.contracts;
                _refreshPriceResult();
              }
              if (state is MembershipContractFailure) {
                _membershipContracts = const [];
                _refreshPriceResult();
              }
            },
          ),
          BlocListener<CustomerSubscriptionCubit, CustomerSubscriptionState>(
            listener: (context, state) {
              if (state is CustomerSubscriptionsLoaded) {
                _customerSubscriptions = state.subscriptions;
                _refreshPriceResult();
              }
              if (state is CustomerSubscriptionFailure) {
                _customerSubscriptions = const [];
                _refreshPriceResult();
              }
            },
          ),
          BlocListener<AccountCubit, AccountState>(
            listener: (context, state) {
              if (state is AccountsLoaded && widget.draft?.paymentAccountId != null) {
                try {
                  final account = state.accounts.firstWhere((a) => a.id == widget.draft!.paymentAccountId);
                  setState(() {
                    _selectedAccount = account;
                  });
                } catch (_) {}
              }
            },
          ),
          BlocListener<OrderCubit, OrderState>(
            listener: (context, state) {
              if (state is OrderActionSuccess) {
                if (state.order != null) {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OrderSuccessScreen(
                        outletId: widget.outletId,
                        order: state.order!,
                      ),
                    ),
                    (route) => route.isFirst,
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.message),
                      backgroundColor: Colors.green,
                    ),
                  );
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (_) =>
                          IndexOrdersScreen(outletId: widget.outletId),
                    ),
                    (route) => route.isFirst,
                  );
                }
              }
              if (state is OrderFailure) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(state.failure.message),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
          ),
        ],
        child: !_isPricingReady
            ? const Center(child: CircularProgressIndicator())
            : ContentConstraint(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(context.space.md),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      OrderReviewCustomerCard(
                        customer: widget.customer,
                        isMember: _priceResult.hasMembershipDiscount,
                      ),
                      SizedBox(height: context.space.md),
                      OrderReviewItemsList(priceResult: _priceResult),
                      SizedBox(height: context.space.md),
                      if (_priceResult.hasAnyDiscount) ...[
                        OrderReviewContextInfo(priceResult: _priceResult),
                        SizedBox(height: context.space.md),
                      ],
                      if (_paymentStatus != 'unpaid')
                        (_isFullyCoveredByPackage)
                            ? Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(context.space.md),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(
                                    context.radius.md,
                                  ),
                                  border: Border.all(
                                    color: Colors.green.shade300,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.inventory_2_rounded,
                                      color: Colors.green.shade700,
                                    ),
                                    SizedBox(width: context.space.sm),
                                    Expanded(
                                      child: Text(
                                        'Pembayaran Ditanggung Paket',
                                        style: context.typography.bodyMedium
                                            .copyWith(
                                              color: Colors.green.shade800,
                                              fontWeight: FontWeight.w700,
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : Column(
                                children: [
                                  OrderReviewPaymentSection(
                                    paymentMethod: _paymentMethod ?? 'cash',
                                    paymentStatus: _paymentStatus,
                                    paidAmountController: _paidAmountController,
                                    onPaymentMethodChanged:
                                        _handlePaymentMethodChanged,
                                    onPaymentStatusChanged:
                                        _handlePaymentStatusChanged,
                                    transferAccountField:
                                        (_paymentMethod == 'transfer' ||
                                            _paymentMethod == 'qris')
                                        ? OrderReviewTransferAccountField(
                                            selectedAccount: _selectedAccount,
                                            onTap: _showTransferAccountPicker,
                                          )
                                        : null,
                                  ),
                                  SizedBox(height: context.space.md),
                                ],
                              )
                      else
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Pembayaran',
                              style: context.typography.labelSmall.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: context.space.sm),
                            DropdownButtonFormField<String>(
                              initialValue: _paymentStatus,
                              decoration: InputDecoration(
                                labelText: 'Status Bayar',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(
                                    context.radius.md,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 12,
                                ),
                              ),
                              items: const [
                                DropdownMenuItem(
                                  value: 'unpaid',
                                  child: Text('Belum Bayar'),
                                ),
                                DropdownMenuItem(
                                  value: 'paid',
                                  child: Text('Lunas'),
                                ),
                                DropdownMenuItem(
                                  value: 'partial',
                                  child: Text('DP / Sebagian'),
                                ),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  _handlePaymentStatusChanged(val);
                                }
                              },
                            ),
                            SizedBox(height: context.space.md),
                          ],
                        ),
                      Text(
                        'Informasi Lain',
                        style: context.typography.labelSmall.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: context.space.sm),
                      OrderReviewDateSection(
                        selectedDate: _estimatedDate,
                        onTap: _selectDate,
                      ),
                      SizedBox(height: context.space.md),
                      OrderReviewNotesField(controller: _notesController),
                      SizedBox(height: context.space.lg),
                      OrderReviewSummarySection(priceResult: _priceResult),
                      SizedBox(height: context.space.xxl),
                    ],
                  ),
                ),
              ),
      ),
      ),
    );
  }
}
