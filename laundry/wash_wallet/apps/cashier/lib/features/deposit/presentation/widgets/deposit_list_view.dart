import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'deposit_card.dart';

class DepositListView extends StatelessWidget {
  final List<Deposit> deposits;
  final Function(Deposit) onTap;
  final VoidCallback onRefresh;

  const DepositListView({
    super.key,
    required this.deposits,
    required this.onTap,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ResponsiveLayout(
        compactLayout: ListView.separated(
          padding: EdgeInsets.all(context.space.md),
          itemCount: deposits.length,
          separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final deposit = deposits[index];
            return DepositCard(deposit: deposit, onTap: () => onTap(deposit));
          },
        ),
        mediumLayout: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(context.space.md),
          child: ResponsiveGrid(
            crossAxisSpacing: context.space.md,
            mainAxisSpacing: context.space.md,
            childAspectRatio: 3.0,
            children: deposits
                .map(
                  (deposit) => DepositCard(
                    deposit: deposit,
                    onTap: () => onTap(deposit),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}
