import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../../laundry_service/presentation/bloc/laundry_service_cubit.dart';
import '../../../../laundry_service/presentation/bloc/laundry_service_state.dart';
import 'laundry_service_empty_state.dart';
import 'laundry_service_tile_card.dart';

class LaundryServiceListView extends StatelessWidget {
  final String searchQuery;
  final List<OrderDraftItem> cartItems;
  final void Function(LaundryService, OrderDraftItem?) onServiceTap;
  final VoidCallback onRetry;

  const LaundryServiceListView({
    super.key,
    required this.searchQuery,
    required this.cartItems,
    required this.onServiceTap,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LaundryServiceCubit, LaundryServiceState>(
      builder: (context, state) {
        if (state is LaundryServiceLoading) {
          return const AppLoadingIndicator();
        }

        if (state is LaundryServiceFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: onRetry,
          );
        }

        if (state is LaundryServicesLoaded) {
          final filteredServices = _filterServices(state.services);

          if (filteredServices.isEmpty) {
            return LaundryServiceEmptyState(searchQuery: searchQuery);
          }

          return RefreshIndicator(
            onRefresh: () async => onRetry(),
            child: ResponsiveLayout(
              compactLayout: ListView.builder(
                padding: EdgeInsets.all(context.space.md),
                itemCount: filteredServices.length,
                itemBuilder: (context, index) {
                  return _buildItem(context, filteredServices[index]);
                },
              ),
              mediumLayout: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(context.space.md),
                child: ResponsiveGrid(
                  crossAxisSpacing: context.space.md,
                  mainAxisSpacing: context.space.md,
                  children: filteredServices
                      .map((service) => _buildItem(context, service))
                      .toList(),
                ),
              ),
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildItem(BuildContext context, LaundryService service) {
    final cartItemIndex = cartItems.indexWhere(
      (item) => item.laundryServiceId == service.id,
    );
    final isInCart = cartItemIndex != -1;
    final quantity = isInCart ? cartItems[cartItemIndex].quantity : 0.0;

    return LaundryServiceTileCard(
      service: service,
      quantity: quantity.toDouble(),
      isInCart: isInCart,
      onTap: () =>
          onServiceTap(service, isInCart ? cartItems[cartItemIndex] : null),
    );
  }

  List<LaundryService> _filterServices(List<LaundryService> services) {
    if (searchQuery.isEmpty) return services;

    return services.where((service) {
      return service.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          (service.category?.name.toLowerCase().contains(
                searchQuery.toLowerCase(),
              ) ??
              false);
    }).toList();
  }
}
