import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../utils/bottom_bar_items_builder.dart';

class AppDynamicBottomBar extends StatelessWidget {
  final String currentRoute;

  const AppDynamicBottomBar({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        if (state is! Authenticated) {
          return const SizedBox.shrink();
        }

        final employee = state.employee;
        final items = BottomBarItemsBuilder.buildItems(employee);
        final routeMap = BottomBarItemsBuilder.buildRouteMap(employee);
        final currentIndex = routeMap.entries
            .firstWhere(
              (entry) => entry.value == currentRoute,
              orElse: () => const MapEntry(0, '/home'),
            )
            .key;

        return AppBottomBar.navigation(
          currentIndex: currentIndex,
          items: items,
          onTap: (index) {
            final route = routeMap[index];
            if (route != null) {
              context.go(route);
            }
          },
        );
      },
    );
  }
}
