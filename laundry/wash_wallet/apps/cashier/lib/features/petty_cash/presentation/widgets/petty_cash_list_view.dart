import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'petty_cash_card.dart';

class PettyCashListView extends StatelessWidget {
  final List<PettyCash> pettyCashes;
  final Function(PettyCash) onTap;
  final VoidCallback onRefresh;

  const PettyCashListView({
    super.key,
    required this.pettyCashes,
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
          itemCount: pettyCashes.length,
          separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final pettyCash = pettyCashes[index];
            return PettyCashCard(
              pettyCash: pettyCash,
              onTap: () => onTap(pettyCash),
            );
          },
        ),
        mediumLayout: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(context.space.md),
          child: ResponsiveGrid(
            crossAxisSpacing: context.space.md,
            mainAxisSpacing: context.space.md,
            childAspectRatio: 3.0,
            children: pettyCashes
                .map(
                  (pettyCash) => PettyCashCard(
                    pettyCash: pettyCash,
                    onTap: () => onTap(pettyCash),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}
