import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/breadcrumb_item.dart';

class PageContentHeader extends StatelessWidget {
  final List<BreadcrumbItem> breadcrumbs;
  final String title;
  final String? subtitle;
  final List<Widget>? statusBadges;
  final List<Widget>? actions;
  final EdgeInsetsGeometry? padding;

  const PageContentHeader({
    super.key,
    required this.breadcrumbs,
    required this.title,
    this.subtitle,
    this.statusBadges,
    this.actions,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (breadcrumbs.isNotEmpty) ...[
            Row(
              children: breadcrumbs.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isLast = index == breadcrumbs.length - 1;

                final text = Text(
                  item.label,
                  style: context.typography.labelMedium.copyWith(
                    color: isLast
                        ? context.colors.primary
                        : context.colors.onSurfaceVariant,
                    fontWeight: isLast ? FontWeight.bold : FontWeight.normal,
                  ),
                );

                Widget child = item.onTap != null && !isLast
                    ? InkWell(onTap: item.onTap, child: text)
                    : text;

                if (!isLast) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      child,
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: Icon(
                          Icons.chevron_right,
                          size: 16,
                          color: context.colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  );
                }
                return child;
              }).toList(),
            ),
            const SizedBox(height: 12),
          ],
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          title,
                          style: context.typography.headlineSmall.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (statusBadges != null &&
                            statusBadges!.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          ...statusBadges!.map(
                            (badge) => Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: badge,
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle!,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              if (actions != null && actions!.isNotEmpty) ...[
                const SizedBox(width: 16),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: actions!
                      .map(
                        (action) => Padding(
                          padding: const EdgeInsets.only(left: 8.0),
                          child: action,
                        ),
                      )
                      .toList(),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
