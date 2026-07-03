import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../../core/helpers/online_guard.dart';
import '../../../customer_subscription/presentation/bloc/customer_subscription_cubit.dart';
import '../../../customer_subscription/presentation/bloc/customer_subscription_state.dart';
import '../../../laundry_service/presentation/bloc/laundry_service_cubit.dart';
import '../../../laundry_service/presentation/bloc/laundry_service_state.dart';
import '../../../membership_contract/presentation/bloc/membership_contract_cubit.dart';
import '../../../membership_contract/presentation/bloc/membership_contract_state.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../domain/models/weigh_draft_item.dart';
import '../../domain/services/order_price_calculator.dart';
import '../../domain/usecases/weigh_usecase.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'widgets/select_service_bottom_sheet.dart';
import 'widgets/weigh_add_item_button.dart';
import 'widgets/weigh_item_card.dart';
import 'widgets/weigh_notes_section.dart';
import 'widgets/weigh_order_header_widget.dart';
import 'widgets/weigh_photo_section.dart';
import 'widgets/weigh_price_summary.dart';

class WeighOrderScreen extends StatefulWidget {
  final Order order;

  const WeighOrderScreen({super.key, required this.order});

  @override
  State<WeighOrderScreen> createState() => _WeighOrderScreenState();
}

class _WeighOrderScreenState extends State<WeighOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _priceCalculator = const OrderPriceCalculator();
  late final TextEditingController _notesController;
  late final TextEditingController _internalNotesController;
  List<WeighDraftItem> _draftItems = [];
  List<LaundryService> _availableServices = [];
  List<CustomerSubscription> _customerSubscriptions = [];
  List<MembershipContract> _membershipContracts = [];
  OrderPriceResult _priceResult = const OrderPriceResult(
    subtotal: 0,
    totalQuotaDiscount: 0,
    totalMembershipDiscount: 0,
    total: 0,
    itemBreakdowns: [],
  );
  String? _photoPath;
  bool _isLoadingServices = false;
  late String _clientRequestId;

  @override
  void initState() {
    super.initState();
    _clientRequestId = IdempotencyKey.generate();
    _draftItems = (widget.order.orderItems ?? [])
        .where((item) => item.laundryServiceId != null)
        .map(WeighDraftItem.fromOrderItem)
        .toList();
    _notesController = TextEditingController(text: widget.order.notes ?? '');
    _internalNotesController = TextEditingController(
      text: widget.order.internalNotes ?? '',
    );
    _loadInitialData();
    _recalculatePrice();

    _notesController.addListener(_saveDraftToStorage);
    _internalNotesController.addListener(_saveDraftToStorage);
  }

  @override
  void dispose() {
    _notesController.removeListener(_saveDraftToStorage);
    _internalNotesController.removeListener(_saveDraftToStorage);
    _notesController.dispose();
    _internalNotesController.dispose();
    super.dispose();
  }

  void _loadInitialData() {
    setState(() => _isLoadingServices = true);
    context.read<LaundryServiceCubit>().getAll(
      outletId: widget.order.outletId,
      isActive: true,
    );
    context.read<MembershipContractCubit>().getAll(
      customerId: widget.order.customerId,
      outletId: widget.order.outletId,
      status: 'active',
      refresh: true,
    );
    context
        .read<CustomerSubscriptionCubit>()
        .loadCustomerSubscriptionsByCustomerId(
          customerId: widget.order.customerId,
          status: 'active',
          perPage: 100,
        );

    final authState = context.read<AuthCubit>().state;
    if (authState is Authenticated) {
      context.read<OrderCubit>().loadWeighingDraft(
        orderId: widget.order.id,
        employeeId: authState.employee.id,
        outletId: widget.order.outletId,
      );
    }
  }

  void _saveDraftToStorage() {
    final authState = context.read<AuthCubit>().state;
    if (authState is! Authenticated) return;

    final draft = WeighingDraft(
      outletId: widget.order.outletId,
      orderId: widget.order.id,
      employeeId: authState.employee.id,
      weight: 0,
      clientRequestId: _clientRequestId,
      orderNotes: _notesController.text,
      internalNotes: _internalNotesController.text,
      photoLocalPath: _photoPath,
      additionalItems: _draftItems
          .map(
            (e) => WeighingDraftItem(
              laundryServiceId: e.laundryServiceId,
              serviceName: e.serviceName,
              qty: e.quantity,
              price: e.unitPrice,
            ),
          )
          .toList(),
      updatedAt: DateTime.now(),
    );
    context.read<OrderCubit>().saveWeighingDraft(draft);
  }

  void _recalculatePrice() {
    final items = _draftItems
        .map(
          (item) => OrderDraftItem(
            laundryServiceId: item.laundryServiceId,
            quantity: item.quantity,
            notes: item.itemNotes,
          ),
        )
        .toList();

    _priceResult = _priceCalculator.calculate(
      items: items,
      services: _availableServices,
      membershipContracts: _membershipContracts,
      customerSubscriptions: _customerSubscriptions,
    );
  }

  void _setDraftItems(List<WeighDraftItem> items) {
    setState(() {
      _draftItems = items;
      _recalculatePrice();
    });
    _saveDraftToStorage();
  }

  void _onServiceSelected(int itemIndex, LaundryService service) {
    final items = List<WeighDraftItem>.from(_draftItems);
    final current = items[itemIndex];
    final nextQuantity = current.quantity < service.minQuantity
        ? service.minQuantity.toDouble()
        : current.quantity;

    items[itemIndex] = current.copyWith(
      laundryServiceId: service.id,
      categoryName: service.category?.name ?? '-',
      serviceName: service.name,
      unitName: service.unit?.name ?? 'Unit',
      unitPrice: service.price,
      minQuantity: service.minQuantity,
      quantity: nextQuantity,
      clearPackageUsage: true,
    );
    _setDraftItems(items);
  }

  void _onAddItem(LaundryService service) {
    _setDraftItems([..._draftItems, WeighDraftItem.fromService(service)]);
  }

  void _onDeleteItem(int index) {
    final items = List<WeighDraftItem>.from(_draftItems)..removeAt(index);
    _setDraftItems(items);
  }

  Future<void> _openServicePicker({int? replaceIndex}) async {
    if (_availableServices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Daftar layanan belum tersedia')),
      );
      return;
    }

    await AppBottomSheet.show<void>(
      context,
      title: 'Pilih Layanan',
      child: SelectServiceBottomSheet(
        services: _availableServices,
        onServiceSelected: (service) {
          if (replaceIndex == null) {
            _onAddItem(service);
          } else {
            _onServiceSelected(replaceIndex, service);
          }
        },
      ),
    );
  }

  void _handleSave() {
    if (_draftItems.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Minimal harus ada 1 item')));
      return;
    }

    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    final authState = context.read<AuthCubit>().state;
    int employeeId = 0;
    if (authState is Authenticated) {
      employeeId = authState.employee.id;
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi Anda telah berakhir, silakan login ulang'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final items = <WeighItemData>[];
    for (var i = 0; i < _draftItems.length; i++) {
      final draft = _draftItems[i];
      final breakdown = i < _priceResult.itemBreakdowns.length
          ? _priceResult.itemBreakdowns[i]
          : null;
      final quotaUsed = breakdown?.quotaCoveredQuantity ?? 0;
      final subscriptionId = quotaUsed > 0
          ? _resolveSubscriptionId(draft.laundryServiceId)
          : null;

      items.add(
        draft.toWeighItemData(
          discountAmount: breakdown?.totalDiscount ?? 0,
          packageUsage: quotaUsed > 0,
          subscriptionId: subscriptionId,
          usedQuota: quotaUsed > 0 ? quotaUsed : null,
        ),
      );
    }

    OnlineGuard.requireOnline(
      actionName: 'Menimbang Order',
      action: () async => context.read<OrderCubit>().weigh(
        WeighParams(
          orderId: widget.order.id,
          employeeId: employeeId,
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
          internalNotes: _internalNotesController.text.trim().isEmpty
              ? null
              : _internalNotesController.text.trim(),
          orderItems: items,
          photoPath: _photoPath,
          clientRequestId: _clientRequestId,
        ),
        outletId: widget.order.outletId,
      ),
      onOffline: (message) => AppSnackbar.error(context, message: message),
    );
  }

  int? _resolveSubscriptionId(int laundryServiceId) {
    for (final subscription in _customerSubscriptions) {
      final hasQuota = subscription.customerQuotas.any(
        (quota) =>
            quota.laundryServiceId == laundryServiceId &&
            quota.remainingQuota > 0,
      );
      if (hasQuota) return subscription.id;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final total =
        _priceResult.total +
        widget.order.pickupFee +
        widget.order.deliveryFee -
        widget.order.discountAmount +
        widget.order.taxAmount;

    return MultiBlocListener(
      listeners: [
        BlocListener<OrderCubit, OrderState>(
          listener: (context, state) {
            if (state is OrderWeighingDraftLoaded && state.draft != null) {
              final draft = state.draft!;
              setState(() {
                if (draft.orderNotes != null) {
                  _notesController.text = draft.orderNotes!;
                }
                if (draft.internalNotes != null) {
                  _internalNotesController.text = draft.internalNotes!;
                }
                if (draft.photoLocalPath != null) {
                  _photoPath = draft.photoLocalPath;
                }
                _draftItems = draft.additionalItems
                    .map(
                      (item) => WeighDraftItem(
                        laundryServiceId: item.laundryServiceId,
                        categoryName: '-',
                        serviceName: item.serviceName,
                        unitName: 'Unit',
                        unitPrice: item.price,
                        minQuantity: 1,
                        quantity: item.qty,
                        itemNotes: item.itemNotes,
                      ),
                    )
                    .toList();
                _clientRequestId = draft.clientRequestId;
                _recalculatePrice();
              });
            }
            if (state is OrderActionSuccess) {
              Navigator.pop(context, true);
            }
            if (state is OrderFailure) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.failure.message),
                  backgroundColor: colorScheme.error,
                ),
              );
            }
          },
        ),
        BlocListener<LaundryServiceCubit, LaundryServiceState>(
          listener: (context, state) {
            if (state is LaundryServicesLoaded) {
              setState(() {
                _availableServices = state.services;
                _isLoadingServices = false;
                _recalculatePrice();
              });
            }
            if (state is LaundryServiceFailure) {
              setState(() => _isLoadingServices = false);
            }
          },
        ),
        BlocListener<MembershipContractCubit, MembershipContractState>(
          listener: (context, state) {
            if (state is MembershipContractsLoaded) {
              setState(() {
                _membershipContracts = state.contracts;
                _recalculatePrice();
              });
            }
            if (state is MembershipContractFailure) {
              setState(() {
                _membershipContracts = const [];
                _recalculatePrice();
              });
            }
          },
        ),
        BlocListener<CustomerSubscriptionCubit, CustomerSubscriptionState>(
          listener: (context, state) {
            if (state is CustomerSubscriptionsLoaded) {
              setState(() {
                _customerSubscriptions = state.subscriptions;
                _recalculatePrice();
              });
            }
            if (state is CustomerSubscriptionFailure) {
              setState(() {
                _customerSubscriptions = const [];
                _recalculatePrice();
              });
            }
          },
        ),
      ],
      child: AppLayout(
        header: AppHeader(
          title: 'Timbang Pesanan',
          onBackPressed: () => Navigator.pop(context),
        ),
        bottomBar: _buildBottomBar(currencyFormat, total),
        body: Form(
          key: _formKey,
          child: ContentConstraint(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(context.space.md),
              child: ResponsiveLayout(
                compactLayout: _buildCompactLayout(colorScheme),
                mediumLayout: _buildMediumLayout(colorScheme),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompactLayout(ColorScheme colorScheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        WeighOrderHeaderWidget(order: widget.order),
        SizedBox(height: context.space.lg),
        WeighPhotoSection(
          selectedPhotoPath: _photoPath,
          onPhotoSelected: (path) => setState(() => _photoPath = path),
        ),
        SizedBox(height: context.space.lg),
        _buildItemsHeader(colorScheme),
        SizedBox(height: context.space.sm),
        _buildItemsList(),
        SizedBox(height: context.space.lg),
        WeighNotesSection(
          notesController: _notesController,
          internalNotesController: _internalNotesController,
        ),
        SizedBox(height: context.space.lg),
        WeighPriceSummary(result: _priceResult, order: widget.order),
        SizedBox(height: context.space.xxl),
      ],
    );
  }

  Widget _buildMediumLayout(ColorScheme colorScheme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              WeighOrderHeaderWidget(order: widget.order),
              SizedBox(height: context.space.lg),
              WeighPhotoSection(
                selectedPhotoPath: _photoPath,
                onPhotoSelected: (path) => setState(() => _photoPath = path),
              ),
              SizedBox(height: context.space.lg),
              WeighNotesSection(
                notesController: _notesController,
                internalNotesController: _internalNotesController,
              ),
            ],
          ),
        ),
        SizedBox(width: context.space.lg),
        Expanded(
          flex: 1,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildItemsHeader(colorScheme),
              SizedBox(height: context.space.sm),
              _buildItemsList(),
              SizedBox(height: context.space.lg),
              WeighPriceSummary(result: _priceResult, order: widget.order),
              SizedBox(height: context.space.xxl),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemsHeader(ColorScheme colorScheme) {
    return Row(
      children: [
        Expanded(
          child: Text(
            'Item Cucian',
            style: context.typography.labelMedium.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        WeighAddItemButton(onTap: () => _openServicePicker()),
      ],
    );
  }

  Widget _buildItemsList() {
    if (_isLoadingServices) {
      return const Center(child: AppLoadingIndicator());
    } else if (_draftItems.isEmpty) {
      return const AppEmptyState(
        title: 'Belum ada item',
        description: 'Tambahkan minimal satu layanan untuk ditimbang',
      );
    } else {
      return Column(
        children: List.generate(
          _draftItems.length,
          (index) => WeighItemCard(
            key: ValueKey('${_draftItems[index].laundryServiceId}-$index'),
            item: _draftItems[index],
            onServiceTap: () => _openServicePicker(replaceIndex: index),
            onQuantityChanged: (quantity) {
              final items = List<WeighDraftItem>.from(_draftItems);
              items[index] = items[index].copyWith(
                quantity: quantity,
                clearPackageUsage: true,
              );
              _setDraftItems(items);
            },
            onNotesChanged: (notes) {
              final items = List<WeighDraftItem>.from(_draftItems);
              items[index] = items[index].copyWith(
                itemNotes: notes,
                clearItemNotes: notes == null,
              );
              _setDraftItems(items);
            },
            onDelete: () => _onDeleteItem(index),
          ),
        ),
      );
    }
  }

  Widget _buildBottomBar(NumberFormat currencyFormat, double total) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total Estimasi', style: context.typography.bodyMedium),
                Text(
                  currencyFormat.format(total),
                  style: context.typography.headlineSmall.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.md),
            BlocBuilder<OrderCubit, OrderState>(
              builder: (context, state) {
                final isLoading = state is OrderLoading;
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _handleSave,
                    child: isLoading
                        ? const AppLoadingIndicator(size: AppEmptyStateSize.sm)
                        : const Text('Simpan & Hitung Harga'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
