import 'package:flutter/material.dart';
import 'app_bottom_sheet_action.dart';
import '../button/app_button.dart';
import '../divider/app_divider.dart';
import '../../theme/elevation/app_elevation.dart';
import 'app_bottom_sheet_layout.dart';
import 'app_bottom_sheet_style.dart';
import 'app_bottom_sheet_variant.dart';
import '../layout/content_constraint.dart';

class AppBottomSheet {
  const AppBottomSheet._();

  static Future<T?> show<T>(
    BuildContext context, {
    String? title,
    String? subtitle,
    required Widget child,
    AppBottomSheetVariant variant = AppBottomSheetVariant.standard,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    return _show<T>(
      context,
      variant: variant,
      title: title,
      subtitle: subtitle,
      child: child,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
    );
  }

  static Future<T?> action<T>(
    BuildContext context, {
    String? title,
    String? subtitle,
    required Widget child,
    AppBottomSheetAction? primaryAction,
    AppBottomSheetAction? secondaryAction,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    return _show<T>(
      context,
      variant: AppBottomSheetVariant.action,
      title: title,
      subtitle: subtitle,
      child: child,
      primaryAction: primaryAction,
      secondaryAction: secondaryAction,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
    );
  }

  static Future<T?> payment<T>(
    BuildContext context, {
    String? title,
    String? subtitle,
    required Widget child,
    AppBottomSheetAction? primaryAction,
    AppBottomSheetAction? secondaryAction,
  }) {
    return _show<T>(
      context,
      variant: AppBottomSheetVariant.payment,
      title: title,
      subtitle: subtitle,
      child: child,
      primaryAction: primaryAction,
      secondaryAction: secondaryAction,
      isDismissible: false,
      enableDrag: false,
    );
  }

  static Future<T?> filter<T>(
    BuildContext context, {
    String? title,
    String? subtitle,
    required Widget child,
    AppBottomSheetAction? primaryAction,
    AppBottomSheetAction? secondaryAction,
  }) {
    return _show<T>(
      context,
      variant: AppBottomSheetVariant.filter,
      title: title,
      subtitle: subtitle,
      child: child,
      primaryAction: primaryAction,
      secondaryAction: secondaryAction,
      isDismissible: true,
      enableDrag: true,
    );
  }

  static Future<T?> select<T>(
    BuildContext context, {
    String? title,
    String? subtitle,
    required List<T> items,
    required Widget Function(T item) itemBuilder,
    T? selectedItem,
  }) {
    return _show<T>(
      context,
      variant: AppBottomSheetVariant.standard,
      title: title,
      subtitle: subtitle,
      child: _SelectList<T>(
        items: items,
        itemBuilder: itemBuilder,
        selectedItem: selectedItem,
      ),
    );
  }

  static Future<T?> _show<T>(
    BuildContext context, {
    required AppBottomSheetVariant variant,
    String? title,
    String? subtitle,
    required Widget child,
    AppBottomSheetAction? primaryAction,
    AppBottomSheetAction? secondaryAction,
    bool? isDismissible,
    bool? enableDrag,
  }) {
    final style = AppBottomSheetStyle(variant: variant, context: context);

    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: style.barrierColor,
      isDismissible: isDismissible ?? style.isDismissible,
      enableDrag: enableDrag ?? style.enableDrag,
      isScrollControlled: true,
      elevation: 0,
      builder: (_) => _AppBottomSheetContent(
        variant: variant,
        title: title,
        subtitle: subtitle,
        primaryAction: primaryAction,
        secondaryAction: secondaryAction,
        child: child,
      ),
    );
  }
}

class _AppBottomSheetContent extends StatelessWidget {
  final AppBottomSheetVariant variant;
  final String? title;
  final String? subtitle;
  final Widget child;
  final AppBottomSheetAction? primaryAction;
  final AppBottomSheetAction? secondaryAction;

  const _AppBottomSheetContent({
    required this.variant,
    required this.title,
    required this.subtitle,
    required this.child,
    required this.primaryAction,
    required this.secondaryAction,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppBottomSheetStyle(variant: variant, context: context);
    final hasActions = primaryAction != null || secondaryAction != null;

    return SafeArea(
      bottom: AppBottomSheetLayout.useBottomSafeArea,
      child: ContentConstraint(
        child: Container(
          decoration: BoxDecoration(
            color: style.backgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: AppElevation.lg,
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: AppBottomSheetLayout.maxHeight(context),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDragHandle(context, style),

                if (title != null || subtitle != null)
                  _buildHeader(context, style),

                Flexible(
                  child: SingleChildScrollView(
                    padding: AppBottomSheetLayout.contentPadding(context),
                    child: child,
                  ),
                ),

                if (hasActions) _buildActionBar(context, style),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDragHandle(BuildContext context, AppBottomSheetStyle style) {
    return Padding(
      padding: EdgeInsets.only(
        top: AppBottomSheetLayout.dragHandleTopPadding(context),
        bottom: AppBottomSheetLayout.dragHandleBottomPadding(context),
      ),
      child: Container(
        width: AppBottomSheetLayout.dragHandleWidth,
        height: AppBottomSheetLayout.dragHandleHeight,
        decoration: BoxDecoration(
          color: style.dragHandleColor,
          borderRadius: style.dragHandleBorderRadius,
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AppBottomSheetStyle style) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: AppBottomSheetLayout.contentHorizontalPadding(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) Text(title!, style: style.titleTextStyle),
          if (title != null && subtitle != null)
            SizedBox(
              height: AppBottomSheetLayout.titleSubtitleSpacing(context),
            ),
          if (subtitle != null) Text(subtitle!, style: style.subtitleTextStyle),
          SizedBox(height: AppBottomSheetLayout.headerContentSpacing(context)),
          const AppDivider(),
        ],
      ),
    );
  }

  Widget _buildActionBar(BuildContext context, AppBottomSheetStyle style) {
    final hasBothActions = primaryAction != null && secondaryAction != null;

    return Container(
      decoration: BoxDecoration(
        color: style.actionBarBackgroundColor,
        border: Border(top: BorderSide(color: style.dividerColor, width: 1.0)),
      ),
      child: Padding(
        padding: AppBottomSheetLayout.actionBarPadding(context),
        child: hasBothActions
            ? Row(
                children: [
                  if (secondaryAction != null)
                    Expanded(child: _buildActionButton(secondaryAction!)),
                  if (primaryAction != null && secondaryAction != null)
                    SizedBox(
                      width: AppBottomSheetLayout.actionButtonSpacing(context),
                    ),
                  if (primaryAction != null)
                    Expanded(child: _buildActionButton(primaryAction!)),
                ],
              )
            : _buildActionButton(primaryAction ?? secondaryAction!),
      ),
    );
  }

  Widget _buildActionButton(AppBottomSheetAction action) {
    if (action.isDestructive) {
      return AppButton.danger(
        label: action.label,
        onPressed: action.onPressed,
        isLoading: action.isLoading,
        isFullWidth: action.isFullWidth,
      );
    }

    if (action.isPrimary) {
      return AppButton.primary(
        label: action.label,
        onPressed: action.onPressed,
        isLoading: action.isLoading,
        isFullWidth: action.isFullWidth,
      );
    }

    return AppButton.outline(
      label: action.label,
      onPressed: action.onPressed,
      isLoading: action.isLoading,
      isFullWidth: action.isFullWidth,
    );
  }
}

class _SelectList<T> extends StatelessWidget {
  final List<T> items;
  final Widget Function(T item) itemBuilder;
  final T? selectedItem;

  const _SelectList({
    required this.items,
    required this.itemBuilder,
    required this.selectedItem,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppBottomSheetStyle(
      variant: AppBottomSheetVariant.standard,
      context: context,
    );

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      separatorBuilder: (_, __) =>
          SizedBox(height: AppBottomSheetLayout.selectItemSpacing(context)),
      itemBuilder: (context, index) {
        final item = items[index];
        final isSelected = item == selectedItem;

        return InkWell(
          onTap: () => Navigator.of(context).pop(item),
          borderRadius: style.selectItemBorderRadius,
          child: Container(
            padding: AppBottomSheetLayout.selectItemPadding(context),
            decoration: BoxDecoration(
              color: style.selectItemBackgroundColor(isSelected),
              border: style.selectItemBorderColor(isSelected) != null
                  ? Border.all(
                      color: style.selectItemBorderColor(isSelected)!,
                      width: style.selectItemBorderWidth,
                    )
                  : null,
              borderRadius: style.selectItemBorderRadius,
            ),
            child: Row(
              children: [
                Expanded(
                  child: DefaultTextStyle(
                    style: isSelected
                        ? style.selectedItemTextStyle
                        : style.selectItemTextStyle,
                    child: itemBuilder(item),
                  ),
                ),
                if (isSelected)
                  Icon(
                    Icons.check_circle,
                    color: style.selectedItemIconColor,
                    size: style.selectedItemIconSize,
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
