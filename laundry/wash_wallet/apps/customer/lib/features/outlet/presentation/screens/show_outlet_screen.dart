import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../order/presentation/bloc/cart_cubit.dart';
import '../../../order/presentation/bloc/cart_state.dart';
import '../../../order/presentation/widgets/cart_floating_button.dart';
import '../../../order/presentation/widgets/service_detail_bottom_sheet.dart';
import '../bloc/outlet_cubit.dart';
import '../bloc/outlet_state.dart';
import '../widgets/category_filter_bar.dart';
import '../widgets/service_card.dart';
import '../widgets/service_category_section.dart';
import '../widgets/outlet_banner_header.dart';

class ShowOutletScreen extends StatefulWidget {
  final int outletId;
  final int? initialServiceId;
  final bool openServiceOnLoad;
  final double? latitude;
  final double? longitude;

  const ShowOutletScreen({
    super.key,
    required this.outletId,
    this.initialServiceId,
    this.openServiceOnLoad = false,
    this.latitude,
    this.longitude,
  });

  @override
  State<ShowOutletScreen> createState() => _ShowOutletScreenState();
}

class _ShowOutletScreenState extends State<ShowOutletScreen> {
  final ScrollController _scrollController = ScrollController();
  final Map<int, GlobalKey> _categoryKeys = {};
  bool _hasAutoOpenedService = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadOutlet();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onServiceTap(LaundryService service, String currentOutletName) async {
    final cartState = context.read<CartCubit>().state;
    final isInCart =
        cartState.activeServices.contains(service.id) &&
        cartState.activeOutletId == widget.outletId;

    final hasConflict =
        cartState.hasItems &&
        cartState.activeOutletId != null &&
        cartState.activeOutletId != widget.outletId;

    if (hasConflict && !isInCart) {
      final activeOutletName = cartState.activeOutletName ?? 'Outlet Lain';
      final confirm = await AppDialog.destructive(
        context,
        title: 'Ganti Outlet?',
        message:
            'Kamu masih memiliki pesanan aktif di "$activeOutletName".\n\n'
            'Menambahkan layanan dari "$currentOutletName" akan menghapus pesanan sebelumnya.',
        confirmLabel: 'Hapus & Ganti',
        cancelLabel: 'Batal',
      );
      if (confirm != true) return;

      if (!mounted) return;
      await context.read<CartCubit>().switchOutletAndAdd(
        service.id,
        widget.outletId,
        currentOutletName,
        supportsCourier: service.supportsCourier,
      );
      return;
    }

    if (!mounted) return;

    ServiceDetailBottomSheet.show(
      context,
      service: service,
      outletId: widget.outletId,
      outletName: currentOutletName,
      isInCart: isInCart,
    );
  }

  void _onCategorySelected(int? categoryId) {
    if (categoryId != null && _categoryKeys.containsKey(categoryId)) {
      final key = _categoryKeys[categoryId]!;
      Scrollable.ensureVisible(
        key.currentContext!,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OutletCubit, OutletState>(
      listener: (context, state) {
        if (state is OutletDetailLoaded) {
          final categories = state.outlet.categories ?? [];
          for (final category in categories) {
            _categoryKeys[category.id] = GlobalKey();
          }

          final cartState = context.read<CartCubit>().state;
          if (!cartState.hasItems ||
              cartState.activeOutletId == widget.outletId) {
            context.read<CartCubit>().setActiveOutlet(
              widget.outletId,
              state.outlet.name,
            );
          }

          _autoOpenServiceBottomSheet(state.outlet);
        }
      },
      builder: (context, state) {
        String title = 'Detail Outlet';
        String? subtitle;
        if (state is OutletDetailLoaded) {
          title = state.outlet.name;
          subtitle = state.outlet.fullAddress;
        }

        return AppLayout(
          header: AppHeader(
            title: title,
            subtitle: subtitle,
            onBackPressed: () => context.pop(),
          ),
          floatingActionButton: const CartFloatingButton(),
          floatingActionButtonLocation:
              FloatingActionButtonLocation.centerFloat,
          body: _buildBody(state),
        );
      },
    );
  }

  Widget _buildBody(OutletState state) {
    if (state is OutletLoading) {
      return const Center(child: AppLoadingIndicator());
    }

    if (state is OutletFailure) {
      return AppEmptyState.error(
        title: 'Gagal Memuat Outlet',
        description: state.failure.message,
        action: AppButton.primary(label: 'Coba Lagi', onPressed: _loadOutlet),
      );
    }

    if (state is OutletDetailLoaded) {
      return _buildSuccessState(state);
    }

    return const SizedBox.shrink();
  }

  Widget _buildSuccessState(OutletDetailLoaded state) {
    final outlet = state.outlet;
    final categories = outlet.categories ?? [];
    final allServices = categories
        .expand((c) => c.laundryServices ?? [])
        .toList();
    final popularServices = allServices.take(5).toList();

    return Column(
      children: [
        OutletBannerHeader(
          outlet: outlet,
          onTap: () => context.push(
            '/outlets/${widget.outletId}/info',
            extra: context.read<OutletCubit>(),
          ),
        ),
        CategoryFilterBar(onCategorySelected: _onCategorySelected),
        Expanded(
          child: SingleChildScrollView(
            controller: _scrollController,
            padding: EdgeInsets.only(bottom: context.space.xxl * 2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (popularServices.isNotEmpty) ...[
                  Padding(
                    padding: EdgeInsets.fromLTRB(
                      context.space.lg,
                      context.space.md,
                      context.space.lg,
                      context.space.sm,
                    ),
                    child: Text(
                      'Paling Laris',
                      style: context.typography.headlineMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: context.colors.textPrimary,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 140,
                    child: BlocBuilder<CartCubit, CartState>(
                      builder: (context, cartState) {
                        return ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: EdgeInsets.symmetric(
                            horizontal: context.space.lg,
                          ),
                          itemCount: popularServices.length,
                          itemBuilder: (context, index) {
                            final service = popularServices[index];
                            final isSelected =
                                cartState.activeOutletId == widget.outletId &&
                                cartState.activeServices.contains(service.id);
                            return Container(
                              width: 280,
                              margin: EdgeInsets.only(right: context.space.md),
                              child: ServiceCard(
                                service: service,
                                isSelected: isSelected,
                                onTap: () =>
                                    _onServiceTap(service, outlet.name),
                                onRemove: () => context
                                    .read<CartCubit>()
                                    .removeFromCart(service.id),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                  SizedBox(height: context.space.md),
                  const AppDivider.dashed(thickness: AppDividerThickness.thin),
                ],
                ...categories.map(
                  (category) => Container(
                    key: _categoryKeys[category.id],
                    child: ServiceCategorySection(
                      outletId: widget.outletId,
                      outletName: outlet.name,
                      category: category,
                      onServiceTap: (service) =>
                          _onServiceTap(service, outlet.name),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _autoOpenServiceBottomSheet(Outlet outlet) {
    if (_hasAutoOpenedService) return;
    if (!widget.openServiceOnLoad || widget.initialServiceId == null) return;

    _hasAutoOpenedService = true;
    final targetService = _findService(outlet, widget.initialServiceId!);

    if (targetService == null || !targetService.isActive) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Layanan ini sudah tidak tersedia. Silakan pilih layanan lain.',
          ),
        ),
      );
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _onServiceTap(targetService, outlet.name);
    });
  }

  LaundryService? _findService(Outlet outlet, int serviceId) {
    final categories = outlet.categories ?? const <Category>[];

    for (final category in categories) {
      final services = category.laundryServices ?? const <LaundryService>[];
      for (final service in services) {
        if (service.id == serviceId) return service;
      }
    }

    return null;
  }

  void _loadOutlet() {
    context.read<OutletCubit>().getById(
      id: widget.outletId,
      latitude: widget.latitude,
      longitude: widget.longitude,
    );
  }
}
