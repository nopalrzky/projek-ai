import 'dart:async';
import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/top_header_action.dart';

class OperationalTopHeader extends StatefulWidget implements PreferredSizeWidget {
  final String? searchHint;
  final ValueChanged<String>? onSearchSubmitted;
  final ValueChanged<String>? onSearchChanged;
  final VoidCallback? onSearchClear;
  final bool showSearch;
  final bool showClock;
  final bool showDate;
  final bool showNotification;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final bool showThemeToggle;
  final VoidCallback? onThemeToggle;
  final String? userName;
  final String? userSubtitle;
  final String? userAvatarUrl;
  final Widget? userAvatarWidget;
  final VoidCallback? onProfileTap;
  final List<TopHeaderAction>? extraActions;
  final double height;

  const OperationalTopHeader({
    super.key,
    this.searchHint,
    this.onSearchSubmitted,
    this.onSearchChanged,
    this.onSearchClear,
    this.showSearch = true,
    this.showClock = true,
    this.showDate = true,
    this.showNotification = true,
    this.notificationCount = 0,
    this.onNotificationTap,
    this.showThemeToggle = false,
    this.onThemeToggle,
    this.userName,
    this.userSubtitle,
    this.userAvatarUrl,
    this.userAvatarWidget,
    this.onProfileTap,
    this.extraActions,
    this.height = 64.0,
  });

  @override
  State<OperationalTopHeader> createState() => _OperationalTopHeaderState();

  @override
  Size get preferredSize => Size.fromHeight(height);
}

class _OperationalTopHeaderState extends State<OperationalTopHeader> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _timer;
  DateTime _currentTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    if (widget.showClock || widget.showDate) {
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        setState(() {
          _currentTime = DateTime.now();
        });
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  String _formatDate(DateTime date) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${monthNames[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: widget.height,
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(
            color: context.colors.outlineVariant,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          if (widget.showSearch)
            Expanded(
              flex: 3,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: widget.searchHint ?? 'Cari...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 20),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {}); // Update suffix icon
                              widget.onSearchClear?.call();
                            },
                          )
                        : null,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                      borderSide: BorderSide(color: context.colors.outlineVariant),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                      borderSide: BorderSide(color: context.colors.outlineVariant),
                    ),
                  ),
                  onChanged: (val) {
                    setState(() {}); // Update clear button visibility
                    widget.onSearchChanged?.call(val);
                  },
                  onSubmitted: widget.onSearchSubmitted,
                ),
              ),
            )
          else
            const Spacer(),
            
          const SizedBox(width: 24),
          
          if (widget.showClock || widget.showDate)
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (widget.showClock)
                  Text(
                    _formatTime(_currentTime),
                    style: context.typography.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (widget.showDate)
                  Text(
                    _formatDate(_currentTime),
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.onSurfaceVariant,
                    ),
                  ),
              ],
            ),
            
          const SizedBox(width: 16),
          
          if (widget.extraActions != null)
            ...widget.extraActions!.map((action) => _buildAction(action.icon, action.onTap, action.tooltip, action.badge)),
            
          if (widget.showThemeToggle)
            _buildAction(
              context.isDarkMode ? Icons.light_mode : Icons.dark_mode,
              widget.onThemeToggle ?? () {},
              'Toggle Theme',
            ),
            
          if (widget.showNotification)
            _buildAction(
              Icons.notifications_outlined,
              widget.onNotificationTap ?? () {},
              'Notifications',
              widget.notificationCount > 0
                  ? Positioned(
                      right: 4,
                      top: 4,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: context.colors.error,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          widget.notificationCount > 9 ? '9+' : widget.notificationCount.toString(),
                          style: context.typography.labelSmall.copyWith(
                            color: context.colors.onError,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    )
                  : null,
            ),
            
          if (widget.userName != null) ...[
            const SizedBox(width: 16),
            const VerticalDivider(width: 1, indent: 12, endIndent: 12),
            const SizedBox(width: 16),
            InkWell(
              onTap: widget.onProfileTap,
              borderRadius: BorderRadius.circular(context.radius.md),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                child: Row(
                  children: [
                    widget.userAvatarWidget ??
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: context.colors.primaryContainer,
                          backgroundImage: widget.userAvatarUrl != null ? NetworkImage(widget.userAvatarUrl!) : null,
                          child: (widget.userAvatarUrl == null && widget.userName!.isNotEmpty)
                              ? Text(
                                  widget.userName!.substring(0, 1).toUpperCase(),
                                  style: context.typography.labelLarge.copyWith(
                                    color: context.colors.onPrimary,
                                  ),
                                )
                              : null,
                        ),
                    if (MediaQuery.sizeOf(context).width > 900) ...[
                      const SizedBox(width: 12),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.userName!,
                            style: context.typography.labelMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (widget.userSubtitle != null)
                            Text(
                              widget.userSubtitle!,
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.onSurfaceVariant,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAction(IconData icon, VoidCallback onTap, [String? tooltip, Widget? badge]) {
    Widget button = IconButton(
      icon: Icon(icon, color: context.colors.onSurfaceVariant),
      onPressed: onTap,
      tooltip: tooltip,
    );
    
    if (badge != null) {
      button = Stack(
        alignment: Alignment.center,
        children: [button, badge],
      );
    }
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: button,
    );
  }
}
