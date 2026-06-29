import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../../account/presentation/bloc/account_cubit.dart';
import '../../../../account/presentation/bloc/account_state.dart';

class OrderReviewTransferAccountField extends StatelessWidget {
  final Account? selectedAccount;
  final VoidCallback onTap;

  const OrderReviewTransferAccountField({
    super.key,
    required this.selectedAccount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rekening Tujuan',
          style: context.typography.labelSmall.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: context.space.xs),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(context.radius.md),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: context.colors.textSecondary.withValues(alpha: 0.5),
              ),
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
            child: BlocBuilder<AccountCubit, AccountState>(
              builder: (context, state) {
                if (state is AccountLoading) {
                  return Row(
                    children: [
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: context.space.md),
                      Text(
                        'Memuat rekening...',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  );
                }

                if (state is AccountFailure) {
                  return Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red, size: 20),
                      SizedBox(width: context.space.md),
                      Expanded(
                        child: Text(
                          state.failure.message,
                          style: context.typography.bodySmall.copyWith(
                            color: Colors.red,
                          ),
                        ),
                      ),
                    ],
                  );
                }

                if (selectedAccount == null) {
                  return Row(
                    children: [
                      Icon(
                        Icons.account_balance,
                        color: context.colors.textSecondary,
                        size: 20,
                      ),
                      SizedBox(width: context.space.md),
                      Expanded(
                        child: Text(
                          'Pilih Rekening Tujuan',
                          style: context.typography.bodyMedium.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.chevron_right,
                        color: context.colors.textSecondary,
                      ),
                    ],
                  );
                }

                return Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: context.colors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.account_balance,
                        color: context.colors.primary,
                        size: 20,
                      ),
                    ),
                    SizedBox(width: context.space.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            selectedAccount!.name,
                            style: context.typography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            selectedAccount!.code,
                            style: context.typography.bodySmall.copyWith(
                              color: context.colors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.chevron_right,
                      color: context.colors.textSecondary,
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
