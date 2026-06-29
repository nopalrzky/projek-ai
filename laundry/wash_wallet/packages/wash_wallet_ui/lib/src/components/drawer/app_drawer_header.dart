import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'styles/app_drawer_style.dart';
import 'variants/app_drawer_variant.dart';

class AppDrawerHeader extends StatelessWidget {
  final String? userName;
  final String? userRole;
  final String? userAvatar;
  final VoidCallback? onTap;
  final Widget? brandLogo;
  final AppDrawerVariant variant;

  const AppDrawerHeader._({
    super.key,
    this.userName,
    this.userRole,
    this.userAvatar,
    this.onTap,
    this.brandLogo,
    required this.variant,
  });

  const AppDrawerHeader.user({
    Key? key,
    required String userName,
    String? userRole,
    String? userAvatar,
    VoidCallback? onTap,
    AppDrawerVariant variant = AppDrawerVariant.standard,
  }) : this._(
         key: key,
         userName: userName,
         userRole: userRole,
         userAvatar: userAvatar,
         onTap: onTap,
         variant: variant,
       );

  const AppDrawerHeader.brand({
    Key? key,
    required Widget brandLogo,
    AppDrawerVariant variant = AppDrawerVariant.standard,
  }) : this._(key: key, brandLogo: brandLogo, variant: variant);

  const AppDrawerHeader.minimal({
    Key? key,
    AppDrawerVariant variant = AppDrawerVariant.compact,
  }) : this._(key: key, variant: variant);

  @override
  Widget build(BuildContext context) {
    final style = AppDrawerStyle(variant: variant, context: context);

    if (variant == AppDrawerVariant.compact) {
      return _buildCompactHeader(context, style);
    }

    if (brandLogo != null) {
      return _buildBrandHeader(context, style);
    }

    if (userName != null) {
      return _buildUserHeader(context, style);
    }

    return const SizedBox.shrink();
  }

  Widget _buildCompactHeader(BuildContext context, AppDrawerStyle style) {
    return Container(
      height: 72.0,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: style.surfaceColor,
        border: Border(
          bottom: BorderSide(color: style.dividerColor, width: 1.0),
        ),
      ),
      child:
          brandLogo ??
          Icon(Icons.menu, size: 28.0, color: context.colors.primary),
    );
  }

  Widget _buildBrandHeader(BuildContext context, AppDrawerStyle style) {
    return Container(
      height: style.headerHeight,
      padding: const EdgeInsets.all(24.0),
      decoration: BoxDecoration(
        color: style.surfaceColor,
        border: Border(
          bottom: BorderSide(color: style.dividerColor, width: 1.0),
        ),
      ),
      child: Center(child: brandLogo),
    );
  }

  Widget _buildUserHeader(BuildContext context, AppDrawerStyle style) {
    return Material(
      color: style.surfaceColor,
      child: InkWell(
        onTap: onTap,
        child: Container(
          height: style.headerHeight,
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: style.dividerColor, width: 1.0),
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: style.avatarSize / 2,
                backgroundColor: context.colors.primary.withValues(alpha: 0.1),
                backgroundImage: userAvatar != null
                    ? NetworkImage(userAvatar!)
                    : null,
                child: userAvatar == null
                    ? Icon(
                        Icons.person,
                        size: style.avatarSize / 1.5,
                        color: context.colors.primary,
                      )
                    : null,
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      userName!,
                      style: style.headerTitleStyle,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (userRole != null) ...[
                      const SizedBox(height: 2.0),
                      Text(
                        userRole!,
                        style: style.headerSubtitleStyle,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              if (onTap != null)
                Icon(
                  Icons.chevron_right,
                  size: 20.0,
                  color: context.colors.textTertiary,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
