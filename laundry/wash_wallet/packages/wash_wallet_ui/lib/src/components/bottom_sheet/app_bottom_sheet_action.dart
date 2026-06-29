import 'package:flutter/widgets.dart';

@immutable
class AppBottomSheetAction {
  final String label;

  final VoidCallback? onPressed;

  final bool isPrimary;

  final bool isDestructive;

  final bool isFullWidth;

  final bool isLoading;

  const AppBottomSheetAction({
    required this.label,
    this.onPressed,
    this.isPrimary = true,
    this.isDestructive = false,
    this.isFullWidth = false,
    this.isLoading = false,
  });

  const AppBottomSheetAction.primary({
    required String label,
    VoidCallback? onPressed,
    bool isFullWidth = false,
    bool isLoading = false,
  }) : this(
         label: label,
         onPressed: onPressed,
         isPrimary: true,
         isDestructive: false,
         isFullWidth: isFullWidth,
         isLoading: isLoading,
       );

  const AppBottomSheetAction.secondary({
    required String label,
    VoidCallback? onPressed,
    bool isFullWidth = false,
    bool isLoading = false,
  }) : this(
         label: label,
         onPressed: onPressed,
         isPrimary: false,
         isDestructive: false,
         isFullWidth: isFullWidth,
         isLoading: isLoading,
       );

  const AppBottomSheetAction.destructive({
    required String label,
    VoidCallback? onPressed,
    bool isFullWidth = false,
    bool isLoading = false,
  }) : this(
         label: label,
         onPressed: onPressed,
         isPrimary: false,
         isDestructive: true,
         isFullWidth: isFullWidth,
         isLoading: isLoading,
       );

  AppBottomSheetAction copyWith({
    String? label,
    VoidCallback? onPressed,
    bool? isPrimary,
    bool? isDestructive,
    bool? isFullWidth,
    bool? isLoading,
  }) {
    return AppBottomSheetAction(
      label: label ?? this.label,
      onPressed: onPressed ?? this.onPressed,
      isPrimary: isPrimary ?? this.isPrimary,
      isDestructive: isDestructive ?? this.isDestructive,
      isFullWidth: isFullWidth ?? this.isFullWidth,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}
