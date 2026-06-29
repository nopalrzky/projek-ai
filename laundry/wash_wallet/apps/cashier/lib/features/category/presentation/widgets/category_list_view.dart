import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'category_tile_card.dart';

class CategoryListView extends StatelessWidget {
  final List<Category> categories;
  final Function(int) onTap;
  final Function(Category) onEdit;
  final Function(int) onDelete;
  final VoidCallback onRefresh;

  const CategoryListView({
    super.key,
    required this.categories,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: context.colors.primary,
      child: ListView.separated(
        padding: EdgeInsets.all(context.space.md),
        itemCount: categories.length,
        separatorBuilder: (context, index) =>
            SizedBox(height: context.space.sm),
        itemBuilder: (context, index) {
          final category = categories[index];
          return CategoryTileCard(
            category: category,
            onTap: () => onTap(category.id),
            onEdit: () => onEdit(category),
            onDelete: () => onDelete(category.id),
          );
        },
      ),
    );
  }
}
