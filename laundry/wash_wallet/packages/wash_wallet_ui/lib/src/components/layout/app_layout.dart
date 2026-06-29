import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../drawer/drawer.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_header/app_header.dart';

class AppLayout extends StatefulWidget {
  final Widget body;
  final Widget? header;
  final Widget? bottomBar;
  final Widget? drawer;
  final Widget? endDrawer;
  final GlobalKey<ScaffoldState>? scaffoldKey;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final bool scrollable;
  final bool keyboardAvoiding;
  final bool safeAreaTop;
  final bool safeAreaBottom;
  final bool dismissKeyboardOnTap;
  final bool extendBody;
  final MainAxisAlignment mainAxisAlignment;
  final CrossAxisAlignment crossAxisAlignment;
  final bool showDrawer;
  final String? userName;
  final VoidCallback? onLogout;
  final String appVersion;

  const AppLayout({
    super.key,
    required this.body,
    this.header,
    this.bottomBar,
    this.drawer,
    this.endDrawer,
    this.scaffoldKey,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.backgroundColor,
    this.padding,
    this.scrollable = false,
    this.keyboardAvoiding = true,
    this.safeAreaTop = false,
    this.safeAreaBottom = true,
    this.dismissKeyboardOnTap = true,
    this.extendBody = false,
    this.mainAxisAlignment = MainAxisAlignment.start,
    this.crossAxisAlignment = CrossAxisAlignment.start,
    this.showDrawer = true,
    this.userName,
    this.onLogout,
    this.appVersion = '1.0.0',
  });

  @override
  State<AppLayout> createState() => _AppLayoutState();
}

class _AppLayoutState extends State<AppLayout> {
  late final GlobalKey<ScaffoldState> _scaffoldKey;

  @override
  void initState() {
    super.initState();
    _scaffoldKey = widget.scaffoldKey ?? GlobalKey<ScaffoldState>();
  }

  void openDrawer() {
    _scaffoldKey.currentState?.openDrawer();
  }

  void openEndDrawer() {
    _scaffoldKey.currentState?.openEndDrawer();
  }

  Widget? _buildDrawer(BuildContext context) {
    if (widget.drawer != null) {
      return widget.drawer;
    }

    if (!widget.showDrawer) {
      return null;
    }

    return DrawerBuilder.build(
      context: context,
      menuData: DrawerMenuConfig.getMenuSections(),
      userName: widget.userName ?? 'Guest',
      onLogout: widget.onLogout,
      version: widget.appVersion,
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = _buildBodyContent(context);
    final drawer = _buildDrawer(context);

    Widget? finalHeader = widget.header;
    if (widget.header is AppHeader && drawer != null) {
      final header = widget.header as AppHeader;
      if (header.leading == null && header.showMenuButton) {
        finalHeader = AppHeader(
          type: header.type,
          title: header.title,
          subtitle: header.subtitle,
          actions: header.actions,
          onBackPressed: header.onBackPressed,
          onMenuPressed: openDrawer,
          backgroundColor: header.backgroundColor,
          contentColor: header.contentColor,
          centerTitle: header.centerTitle,
          showMenuButton: header.showMenuButton,
        );
      }
    }

    return GestureDetector(
      onTap: widget.dismissKeyboardOnTap
          ? () => FocusManager.instance.primaryFocus?.unfocus()
          : null,
      child: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle(
          systemNavigationBarColor:
              widget.backgroundColor ?? context.colors.background,
          systemNavigationBarIconBrightness: Brightness.dark,
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
        ),
        child: Scaffold(
          key: _scaffoldKey,
          backgroundColor: widget.backgroundColor ?? context.colors.background,
          resizeToAvoidBottomInset: widget.keyboardAvoiding,
          extendBody: widget.extendBody,
          drawer: drawer,
          endDrawer: widget.endDrawer,
          body: Column(
            children: [
              if (finalHeader != null) finalHeader,
              Expanded(
                child: SafeArea(
                  top: widget.safeAreaTop,
                  bottom: widget.safeAreaBottom && widget.bottomBar == null,
                  left: false,
                  right: false,
                  child: content,
                ),
              ),
            ],
          ),
          bottomNavigationBar: widget.bottomBar,
          floatingActionButton: widget.floatingActionButton,
          floatingActionButtonLocation: widget.floatingActionButtonLocation,
        ),
      ),
    );
  }

  Widget _buildBodyContent(BuildContext context) {
    Widget content = widget.body;

    if (widget.padding != null) {
      content = Padding(padding: widget.padding!, child: content);
    }

    if (widget.scrollable) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: content,
      );
    }

    return SizedBox.expand(child: content);
  }
}
