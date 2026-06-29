import 'package:flutter/material.dart';
import 'app_layout.dart';

class AppLayoutWithDrawer extends StatefulWidget {
  final Widget body;
  final Widget? header;
  final Widget? bottomBar;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final bool scrollable;
  final String? appVersion;
  final String? userName;
  final VoidCallback? onLogout;

  const AppLayoutWithDrawer({
    super.key,
    required this.body,
    this.header,
    this.bottomBar,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.backgroundColor,
    this.padding,
    this.scrollable = false,
    this.appVersion,
    this.userName,
    this.onLogout,
  });

  @override
  State<AppLayoutWithDrawer> createState() => _AppLayoutWithDrawerState();
}

class _AppLayoutWithDrawerState extends State<AppLayoutWithDrawer> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      scaffoldKey: _scaffoldKey,
      header: widget.header != null
          ? _wrapHeaderWithMenuButton(widget.header!)
          : null,
      bottomBar: widget.bottomBar,
      floatingActionButton: widget.floatingActionButton,
      floatingActionButtonLocation: widget.floatingActionButtonLocation,
      backgroundColor: widget.backgroundColor,
      padding: widget.padding,
      scrollable: widget.scrollable,
      userName: widget.userName,
      onLogout: widget.onLogout,
      appVersion: widget.appVersion ?? '1.0.0',
      body: widget.body,
    );
  }

  Widget _wrapHeaderWithMenuButton(Widget header) {
    return header;
  }

  void openDrawer() {
    _scaffoldKey.currentState?.openDrawer();
  }
}
