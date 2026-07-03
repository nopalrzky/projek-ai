import 'package:flutter/material.dart';
import '../../theme/responsive/app_breakpoints.dart';
import 'app_bottom_sheet.dart';
import 'app_bottom_sheet_variant.dart';

Future<T?> showAdaptiveSheet<T>(
  BuildContext context, {
  String? title,
  String? subtitle,
  required Widget child,
  AppBottomSheetVariant variant = AppBottomSheetVariant.standard,
  bool isDismissible = true,
  bool enableDrag = true,
}) {
  if (AppBreakpoints.isCompact(context)) {
    return AppBottomSheet.show<T>(
      context,
      title: title,
      subtitle: subtitle,
      child: child,
      variant: variant,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
    );
  } else {
    // Show as a dialog with max width for tablets
    return showDialog<T>(
      context: context,
      barrierDismissible: isDismissible,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        clipBehavior: Clip.antiAlias,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 560),
          child: _AppBottomSheetContentAdapter(
            title: title,
            subtitle: subtitle,
            child: child,
          ),
        ),
      ),
    );
  }
}

class _AppBottomSheetContentAdapter extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final Widget child;

  const _AppBottomSheetContentAdapter({
    this.title,
    this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Text(
              title!,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
          ],
          if (subtitle != null) ...[
            Text(
              subtitle!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).textTheme.bodySmall?.color,
              ),
            ),
            const SizedBox(height: 16),
          ],
          if (title != null || subtitle != null) const Divider(height: 32),
          Flexible(child: SingleChildScrollView(child: child)),
        ],
      ),
    );
  }
}
