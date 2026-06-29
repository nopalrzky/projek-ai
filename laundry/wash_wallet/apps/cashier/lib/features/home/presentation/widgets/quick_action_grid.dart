import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'quick_action_item.dart';
import 'quick_action_card.dart';

class QuickActionGrid extends StatelessWidget {
  final List<QuickActionItem> items;

  const QuickActionGrid({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      child: ResponsiveGrid(
        mainAxisSpacing: context.space.md,
        crossAxisSpacing: context.space.md,
        childAspectRatio: 1.5,
        children: items.map((item) {
          return QuickActionCard(
            icon: item.icon,
            label: item.label,
            color: item.color,
            onTap: item.onTap,
          );
        }).toList(),
      ),
    );
  }
}

