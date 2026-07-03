import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../../features/laundry_service/presentation/bloc/laundry_service_cubit.dart';
import '../../../../features/laundry_service/presentation/bloc/laundry_service_state.dart';
import '../../../../features/unit/presentation/bloc/unit_cubit.dart';
import '../../../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../../../features/auth/presentation/bloc/auth_state.dart';

import '../../domain/services/order_price_calculator.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/laundry_service/laundry_service_cart_bottom_summary.dart';
import '../widgets/laundry_service/laundry_service_list_view.dart';
import '../widgets/laundry_service/laundry_service_search_bar.dart';
import 'input_order_item_screen.dart';
import 'review_order_screen.dart';

class SelectLaundryServiceForOrderScreen extends StatefulWidget {
  final int outletId;
  final Customer customer;

  const SelectLaundryServiceForOrderScreen({
    super.key,
    required this.outletId,
    required this.customer,
  });

  @override
  State<SelectLaundryServiceForOrderScreen> createState() =>
      _SelectLaundryServiceForOrderScreenState();
}

class _SelectLaundryServiceForOrderScreenState
    extends State<SelectLaundryServiceForOrderScreen> {
  List<OrderDraftItem> _cartItems = [];
  List<LaundryService> _availableServices = [];
  final TextEditingController _searchController = TextEditingController();
  final OrderPriceCalculator _priceCalculator = const OrderPriceCalculator();

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadInitialData() {
    context.read<UnitCubit>().getAll();
    context.read<LaundryServiceCubit>().getAll(
      outletId: widget.outletId,
      isActive: true,
    );

    final authState = context.read<AuthCubit>().state;
    if (authState is Authenticated) {
      context.read<OrderCubit>().loadDraft(
        customerId: widget.customer.id,
        outletId: widget.outletId,
        employeeId: authState.employee.id,
      );
    }
  }

  void _openInputQtyScreen(
    LaundryService service,
    OrderDraftItem? existingItem,
  ) async {
    final result = await Navigator.push<OrderDraftItem?>(
      context,
      MaterialPageRoute(
        builder: (_) =>
            InputOrderItemScreen(service: service, initialItem: existingItem),
      ),
    );

    if (result != null) {
      _updateCart(result);
    }
  }

  void _updateCart(OrderDraftItem newItem) {
    setState(() {
      final index = _cartItems.indexWhere(
        (i) => i.laundryServiceId == newItem.laundryServiceId,
      );

      if (newItem.quantity <= 0) {
        if (index != -1) _cartItems.removeAt(index);
      } else {
        if (index != -1) {
          _cartItems[index] = newItem;
        } else {
          _cartItems.add(newItem);
        }
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
      items: _cartItems,
      updatedAt: DateTime.now(),
    );
    context.read<OrderCubit>().saveDraft(draft);
  }

  void _navigateToReview() {
    final orderState = context.read<OrderCubit>().state;
    OrderDraft? draft;
    if (orderState is OrderDraftLoaded) {
      draft = orderState.draft;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReviewOrderScreen(
          outletId: widget.outletId,
          customer: widget.customer,
          items: _cartItems,
          services: _availableServices,
          draft: draft,
        ),
      ),
    );
  }

  OrderPriceResult _calculatePrice() {
    return _priceCalculator.calculate(
      items: _cartItems,
      services: _availableServices,
      membershipContracts: const [],
      customerSubscriptions: const [],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<OrderCubit, OrderState>(
          listener: (context, state) {
            if (state is OrderDraftLoaded && state.draft != null) {
              final draft = state.draft!;
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (ctx) => AlertDialog(
                  title: Text(
                    draft.status == 'submit_failed'
                        ? 'Pesanan Gagal Terkirim'
                        : 'Draft Pesanan Ditemukan',
                  ),
                  content: Text(
                    draft.status == 'submit_failed'
                        ? 'Pesanan sebelumnya untuk ${widget.customer.name} gagal terkirim (Error: ${draft.lastError ?? 'Unknown'}). Ingin mencoba mengirim ulang, mengedit, atau hapus draft?'
                        : 'Draft pesanan untuk ${widget.customer.name} ditemukan. Ingin melanjutkan draft ini atau mulai yang baru?',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        final authState = context.read<AuthCubit>().state;
                        if (authState is Authenticated) {
                          context.read<OrderCubit>().clearDraft(
                            customerId: widget.customer.id,
                            outletId: widget.outletId,
                            employeeId: authState.employee.id,
                          );
                        }
                        setState(() {
                          _cartItems = [];
                        });
                      },
                      child: Text(
                        draft.status == 'submit_failed'
                            ? 'Hapus Draft'
                            : 'Mulai Baru',
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        setState(() {
                          _cartItems = List.from(draft.items);
                        });
                      },
                      child: Text(
                        draft.status == 'submit_failed'
                            ? 'Lanjutkan / Retry'
                            : 'Lanjutkan Draft',
                      ),
                    ),
                  ],
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
              });
            }
          },
        ),
      ],
      child: AppLayout(
        header: AppHeader(
          title: 'Pilih Layanan',
          subtitle: widget.customer.name,
          onBackPressed: () => Navigator.pop(context),
        ),
        bottomBar: _cartItems.isNotEmpty ? _buildBottomBar() : null,
        body: ContentConstraint(
          child: Column(
            children: [
              LaundryServiceSearchBar(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                onClear: () => setState(() {}),
              ),

              Expanded(
                child: LaundryServiceListView(
                  searchQuery: _searchController.text,
                  cartItems: _cartItems,
                  onServiceTap: _openInputQtyScreen,
                  onRetry: _loadInitialData,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    final priceResult = _calculatePrice();

    return LaundryServiceCartBottomSummary(
      itemCount: _cartItems.length,
      subtotal: priceResult.subtotal,
      discount: priceResult.totalDiscount,
      total: priceResult.total,
      onContinue: _navigateToReview,
    );
  }
}
