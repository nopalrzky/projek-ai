import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ChoiceCardWidget extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const ChoiceCardWidget({
    super.key,
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? context.colors.primary
                  : context.colors.textSecondary,
            ),
            SizedBox(height: context.space.xs),
            Text(
              title,
              style: context.typography.bodySmall.copyWith(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected
                    ? context.colors.primary
                    : context.colors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
