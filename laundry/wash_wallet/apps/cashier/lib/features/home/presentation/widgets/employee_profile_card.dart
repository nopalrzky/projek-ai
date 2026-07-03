import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class EmployeeProfileCard extends StatelessWidget {
  final String employeeName;
  final String employeePhone;

  const EmployeeProfileCard({
    super.key,
    required this.employeeName,
    required this.employeePhone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Avatar
          CircleAvatar(
            radius: 28,
            backgroundColor: context.colors.primary.withValues(alpha: 0.1),
            child: Text(
              employeeName.isNotEmpty ? employeeName[0].toUpperCase() : 'E',
              style: context.typography.headlineLarge.copyWith(
                color: context.colors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          SizedBox(width: context.space.md),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  employeeName,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: context.colors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: context.space.xs),
                Row(
                  children: [
                    Icon(
                      Icons.phone_outlined,
                      size: 14,
                      color: context.colors.textSecondary,
                    ),
                    SizedBox(width: context.space.xs),
                    Text(
                      employeePhone,
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.space.xs),
              ],
            ),
          ),

          // Actions
        ],
      ),
    );
  }
}
