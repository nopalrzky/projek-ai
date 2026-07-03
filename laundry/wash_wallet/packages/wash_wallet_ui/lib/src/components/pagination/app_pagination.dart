import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';

class AppPagination extends StatelessWidget {
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final bool isLoading;
  final void Function(int page)? onPageChanged;
  final int maxVisiblePages;

  const AppPagination({
    super.key,
    required this.currentPage,
    required this.lastPage,
    required this.total,
    this.from,
    this.to,
    this.isLoading = false,
    this.onPageChanged,
    this.maxVisiblePages = 5,
  });

  List<dynamic> _getPageNumbers() {
    final List<dynamic> pages = [];
    if (lastPage <= 7) {
      for (int i = 1; i <= lastPage; i++) {
        pages.add(i);
      }
    } else {
      pages.add(1);
      if (currentPage > 3) {
        pages.add('...');
      }

      int start = (currentPage - 1).clamp(2, lastPage - 1);
      int end = (currentPage + 1).clamp(2, lastPage - 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= lastPage - 2) {
        start = lastPage - 3;
      }

      for (int i = start; i <= end; i++) {
        if (i > 1 && i < lastPage) {
          pages.add(i);
        }
      }

      if (currentPage < lastPage - 2) {
        pages.add('...');
      }
      pages.add(lastPage);
    }
    return pages;
  }

  @override
  Widget build(BuildContext context) {
    if (lastPage <= 1 || total == 0) {
      return const SizedBox.shrink();
    }

    final pageItems = _getPageNumbers();

    final prevDisabled = isLoading || currentPage <= 1 || onPageChanged == null;
    final nextDisabled =
        isLoading || currentPage >= lastPage || onPageChanged == null;

    final infoText = (from != null && to != null)
        ? 'Menampilkan $from sampai $to dari $total hasil'
        : 'Menampilkan $total hasil';

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;

        final rangeInfo = Text(
          infoText,
          style: context.theme.textTheme.bodyMedium?.copyWith(
            color: context.colors.textSecondary,
          ),
        );

        final controls = Wrap(
          spacing: context.space.xs,
          runSpacing: context.space.xs,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _NavigationButton(
              label: 'Sebelumnya',
              icon: Icons.chevron_left,
              isDisabled: prevDisabled,
              onPressed: () => onPageChanged?.call(currentPage - 1),
            ),

            ...pageItems.map((item) {
              if (item == '...') {
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: context.space.xs),
                  child: Text(
                    '...',
                    style: context.theme.textTheme.bodyMedium?.copyWith(
                      color: context.colors.textTertiary,
                    ),
                  ),
                );
              }

              final pageNum = item as int;
              final isActive = pageNum == currentPage;

              return _PageButton(
                pageNum: pageNum,
                isActive: isActive,
                isDisabled: isLoading,
                onPressed: () {
                  if (!isActive && onPageChanged != null) {
                    onPageChanged!(pageNum);
                  }
                },
              );
            }),

            // Button Berikutnya
            _NavigationButton(
              label: 'Berikutnya',
              icon: Icons.chevron_right,
              isDisabled: nextDisabled,
              onPressed: () => onPageChanged?.call(currentPage + 1),
              isRightIcon: true,
            ),
          ],
        );

        if (isMobile) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              rangeInfo,
              SizedBox(height: context.space.sm),
              controls,
            ],
          );
        }

        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [rangeInfo, controls],
        );
      },
    );
  }
}

class _NavigationButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isDisabled;
  final VoidCallback onPressed;
  final bool isRightIcon;

  const _NavigationButton({
    required this.label,
    required this.icon,
    required this.isDisabled,
    required this.onPressed,
    this.isRightIcon = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = OutlinedButton.styleFrom(
      foregroundColor: isDisabled
          ? context.colors.textDisabled
          : context.colors.textSecondary,
      backgroundColor: Colors.transparent,
      side: BorderSide(
        color: isDisabled
            ? context.colors.disabledBorder
            : context.colors.border,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.xs,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
    );

    final child = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!isRightIcon) ...[
          Icon(icon, size: 18),
          SizedBox(width: context.space.xs),
        ],
        Text(
          label,
          style: context.theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
            color: isDisabled ? context.colors.textDisabled : null,
          ),
        ),
        if (isRightIcon) ...[
          SizedBox(width: context.space.xs),
          Icon(icon, size: 18),
        ],
      ],
    );

    return OutlinedButton(
      style: style,
      onPressed: isDisabled ? null : onPressed,
      child: child,
    );
  }
}

class _PageButton extends StatelessWidget {
  final int pageNum;
  final bool isActive;
  final bool isDisabled;
  final VoidCallback onPressed;

  const _PageButton({
    required this.pageNum,
    required this.isActive,
    required this.isDisabled,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final Color bgColor = isActive
        ? context.colors.primary
        : Colors.transparent;
    final Color textColor = isActive
        ? context.colors.onPrimary
        : (isDisabled
              ? context.colors.textDisabled
              : context.colors.textSecondary);
    final BorderSide borderSide = isActive
        ? BorderSide.none
        : BorderSide(
            color: isDisabled
                ? context.colors.disabledBorder
                : context.colors.border,
          );

    return SizedBox(
      width: 36,
      height: 36,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: textColor,
          side: borderSide,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(context.radius.md),
          ),
        ),
        onPressed: isDisabled ? null : onPressed,
        child: Text(
          '$pageNum',
          style: context.theme.textTheme.bodyMedium?.copyWith(
            fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
            color: textColor,
          ),
        ),
      ),
    );
  }
}
