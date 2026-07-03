class OperationalShellConfig {
  final double expandedSidebarWidth;
  final double collapsedSidebarWidth;
  /// Reserved for app-level secondary panels; feature order detail flows may
  /// still choose dialogs or local layouts instead of this shell slot.
  final double secondaryBodyWidth;

  const OperationalShellConfig({
    this.expandedSidebarWidth = 268.0,
    this.collapsedSidebarWidth = 80.0,
    this.secondaryBodyWidth = 320.0,
  });
}
