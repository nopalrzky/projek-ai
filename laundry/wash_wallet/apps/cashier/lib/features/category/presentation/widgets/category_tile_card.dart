import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

enum CategoryMenuOption { edit, delete }

class CategoryTileCard extends StatelessWidget {
  final Category category;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const CategoryTileCard({
    super.key,
    required this.category,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.lg),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.lg),
        child: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(context.radius.lg),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                context.colors.surface,
                context.colors.surface.withValues(alpha: 0.95),
              ],
            ),
          ),
          child: Row(
            children: [
              _buildIcon(context),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            category.name,
                            style: context.typography.headlineMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (!category.isActive)
                          Container(
                            margin: EdgeInsets.only(left: context.space.xs),
                            padding: EdgeInsets.symmetric(
                              horizontal: context.space.xs,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: context.colors.disabled.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(
                                context.radius.sm,
                              ),
                              border: Border.all(
                                color: context.colors.disabled.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                            ),
                            child: Text(
                              'Non-Aktif',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                    if (category.description != null &&
                        category.description!.isNotEmpty) ...[
                      SizedBox(height: context.space.sm),
                      Text(
                        category.description!,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              SizedBox(width: context.space.sm),
              _buildMenuButton(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            context.colors.primary,
            context.colors.primary.withValues(alpha: 0.7),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: CircleAvatar(
        radius: 28,
        backgroundColor: Colors.transparent,
        child: Icon(Icons.category_rounded, color: Colors.white, size: 24),
      ),
    );
  }

  Widget _buildMenuButton(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.background,
        borderRadius: BorderRadius.circular(context.radius.sm),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.3)),
      ),
      child: PopupMenuButton<CategoryMenuOption>(
        icon: Icon(
          Icons.more_vert_rounded,
          color: context.colors.textSecondary,
          size: 20,
        ),
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        onSelected: (CategoryMenuOption item) {
          switch (item) {
            case CategoryMenuOption.edit:
              onEdit();
              break;
            case CategoryMenuOption.delete:
              onDelete();
              break;
          }
        },
        itemBuilder: (BuildContext context) =>
            <PopupMenuEntry<CategoryMenuOption>>[
              PopupMenuItem<CategoryMenuOption>(
                value: CategoryMenuOption.edit,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.edit_rounded,
                        size: 18,
                        color: context.colors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<CategoryMenuOption>(
                value: CategoryMenuOption.delete,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.delete_rounded,
                        size: 18,
                        color: context.colors.error,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Hapus',
                      style: TextStyle(color: context.colors.error),
                    ),
                  ],
                ),
              ),
            ],
      ),
    );
  }
}
