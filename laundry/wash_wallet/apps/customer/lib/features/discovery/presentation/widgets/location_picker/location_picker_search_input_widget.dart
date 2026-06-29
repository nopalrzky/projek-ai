import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../bloc/location_picker_cubit.dart';

class LocationPickerSearchInputWidget extends StatefulWidget {
  const LocationPickerSearchInputWidget({super.key});

  @override
  State<LocationPickerSearchInputWidget> createState() =>
      _LocationPickerSearchInputWidgetState();
}

class _LocationPickerSearchInputWidgetState
    extends State<LocationPickerSearchInputWidget> {
  final _controller = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_refresh);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.removeListener(_refresh);
    _controller.dispose();
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      context.read<LocationPickerCubit>().searchAddress(keyword: value);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppTextField.filled(
      controller: _controller,
      hint: 'Cari alamat...',
      prefixIcon: const Icon(Icons.search_rounded),
      suffixIcon: _controller.text.isEmpty
          ? null
          : IconButton(
              tooltip: 'Bersihkan alamat',
              icon: const Icon(Icons.close_rounded),
              onPressed: () {
                _debounce?.cancel();
                _controller.clear();
                context.read<LocationPickerCubit>().clearSearch();
              },
            ),
      onChanged: _onChanged,
      onSubmitted: (value) {
        _debounce?.cancel();
        context.read<LocationPickerCubit>().searchAddress(keyword: value);
      },
    );
  }
}
