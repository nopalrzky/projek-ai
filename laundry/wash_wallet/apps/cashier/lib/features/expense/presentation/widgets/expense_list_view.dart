import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'expense_card.dart';

class ExpenseListView extends StatelessWidget {
  final List<Expense> expenses;
  final Function(Expense) onTap;
  final VoidCallback onRefresh;

  const ExpenseListView({
    super.key,
    required this.expenses,
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
          itemCount: expenses.length,
          separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final expense = expenses[index];
            return ExpenseCard(expense: expense, onTap: () => onTap(expense));
          },
        ),
        mediumLayout: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(context.space.md),
          child: ResponsiveGrid(
            crossAxisSpacing: context.space.md,
            mainAxisSpacing: context.space.md,
            childAspectRatio: 3.0,
            children: expenses
                .map(
                  (expense) => ExpenseCard(
                    expense: expense,
                    onTap: () => onTap(expense),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}
