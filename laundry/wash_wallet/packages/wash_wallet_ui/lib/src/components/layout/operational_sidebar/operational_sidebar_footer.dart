import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/sidebar_user_account.dart';

class OperationalSidebarFooter extends StatelessWidget {
  final SidebarUserAccount userAccount;
  final bool collapsed;

  const OperationalSidebarFooter({
    super.key,
    required this.userAccount,
    required this.collapsed,
  });

  void _showUserMenu(BuildContext context) {
    if (userAccount.actions.isEmpty) return;

    // Calculate position
    final RenderBox button = context.findRenderObject() as RenderBox;
    final RenderBox overlay =
        Navigator.of(context).overlay!.context.findRenderObject() as RenderBox;
    final RelativeRect position = RelativeRect.fromRect(
      Rect.fromPoints(
        button.localToGlobal(Offset(button.size.width, 0), ancestor: overlay),
        button.localToGlobal(
          button.size.bottomRight(Offset.zero),
          ancestor: overlay,
        ),
      ),
      Offset.zero & overlay.size,
    );

    showMenu(
      context: context,
      position: position,
      items: userAccount.actions.map((action) {
        return PopupMenuItem(
          onTap: action.onTap,
          child: Row(
            children: [
              Icon(
                action.icon,
                size: 20,
                color: context.colors.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Text(action.label),
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final avatar =
        userAccount.avatarWidget ??
        CircleAvatar(
          radius: 20,
          backgroundColor: context.colors.primaryContainer,
          backgroundImage: userAccount.avatarUrl != null
              ? NetworkImage(userAccount.avatarUrl!)
              : null,
          child: (userAccount.avatarUrl == null && userAccount.name.isNotEmpty)
              ? Text(
                  userAccount.name.substring(0, 1).toUpperCase(),
                  style: context.typography.titleMedium.copyWith(
                    color: context.colors.onPrimary,
                  ),
                )
              : null,
        );

    final content = InkWell(
      onTap: userAccount.actions.isNotEmpty
          ? () => _showUserMenu(context)
          : null,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 16.0),
        child: Row(
          mainAxisAlignment: collapsed
              ? MainAxisAlignment.center
              : MainAxisAlignment.start,
          children: [
            avatar,
            if (!collapsed) ...[
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      userAccount.name,
                      style: context.typography.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (userAccount.subtitle != null)
                      Text(
                        userAccount.subtitle!,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              if (userAccount.actions.isNotEmpty)
                Icon(
                  Icons.more_vert,
                  size: 20,
                  color: context.colors.onSurfaceVariant,
                ),
            ],
          ],
        ),
      ),
    );

    if (collapsed) {
      return Tooltip(
        message: userAccount.name,
        preferBelow: false,
        child: content,
      );
    }
    return content;
  }
}
