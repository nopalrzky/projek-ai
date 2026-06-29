import 'dart:async';

import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoverySearchBarWidget extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback? onClear;
  final String hint;

  const DiscoverySearchBarWidget({
    super.key,
    required this.controller,
    required this.onChanged,
    this.onClear,
    this.hint = 'Cari cuci kiloan, sepatu, express',
  });

  @override
  State<DiscoverySearchBarWidget> createState() =>
      _DiscoverySearchBarWidgetState();
}

class _DiscoverySearchBarWidgetState extends State<DiscoverySearchBarWidget> {
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_refresh);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    widget.controller.removeListener(_refresh);
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      widget.onChanged(value);
    });
  }

  void _onSubmitted(String value) {
    _debounce?.cancel();
    widget.onChanged(value);
  }

  @override
  Widget build(BuildContext context) {
    return AppTextField.filled(
      controller: widget.controller,
      hint: widget.hint,
      textInputAction: TextInputAction.search,
      prefixIcon: const Icon(Icons.search_rounded),
      suffixIcon: widget.controller.text.isEmpty
          ? null
          : IconButton(
              tooltip: 'Bersihkan pencarian',
              icon: const Icon(Icons.close_rounded),
              onPressed: () {
                _debounce?.cancel();
                widget.controller.clear();
                widget.onClear?.call();
              },
            ),
      onChanged: _onChanged,
      onSubmitted: _onSubmitted,
    );
  }
}
