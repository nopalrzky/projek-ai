import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../order/presentation/bloc/cart_cubit.dart';
import '../../../order/presentation/bloc/cart_state.dart';
import 'service_card.dart';

class ServiceCategorySection extends StatelessWidget {
  final int outletId;
  final String outletName;
  final Category category;
  final void Function(LaundryService) onServiceTap;

  const ServiceCategorySection({
    super.key,
    required this.outletId,
    required this.outletName,
    required this.category,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    final services = category.laundryServices ?? [];
    if (services.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(
            context.space.lg,
            context.space.lg,
            context.space.lg,
            context.space.sm,
          ),
          child: Text(
            category.name,
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
        ),
        BlocBuilder<CartCubit, CartState>(
          builder: (context, cartState) {
            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: context.space.lg),
              itemCount: services.length,
              separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
              itemBuilder: (context, index) {
                final service = services[index];
                final isSelected =
                    cartState.activeOutletId == outletId &&
                    cartState.activeServices.contains(service.id);
                return ServiceCard(
                  service: service,
                  isSelected: isSelected,
                  onTap: () => onServiceTap(service),
                  onRemove: () =>
                      context.read<CartCubit>().removeFromCart(service.id),
                );
              },
            );
          },
        ),
      ],
    );
  }
}
