import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../order/presentation/bloc/cart_cubit.dart';
import '../../../order/presentation/bloc/cart_state.dart';

class HomeCartButtonWidget extends StatelessWidget {
  final VoidCallback onTap;
  final Color iconColor;

  const HomeCartButtonWidget({
    super.key,
    required this.onTap,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, state) {
        return Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              onPressed: onTap,
              icon: const Icon(Icons.shopping_cart_outlined),
              color: iconColor,
            ),
            if (state is CartLoaded && state.totalItems > 0)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: context.colors.danger,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${state.totalItems}',
                    style: context.typography.labelSmall.copyWith(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
