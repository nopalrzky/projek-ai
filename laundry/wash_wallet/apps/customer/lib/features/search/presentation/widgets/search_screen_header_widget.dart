import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SearchScreenHeaderWidget extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onClear;

  const SearchScreenHeaderWidget({
    super.key,
    required this.controller,
    required this.onSubmitted,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.md,
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          Expanded(
            child: AppTextField.filled(
              controller: controller,
              autofocus: true,
              hint: 'Cari layanan atau outlet',
              textInputAction: TextInputAction.search,
              onSubmitted: onSubmitted,
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: ValueListenableBuilder(
                valueListenable: controller,
                builder: (context, value, child) {
                  if (value.text.isEmpty) return const SizedBox.shrink();
                  return IconButton(
                    onPressed: onClear,
                    icon: const Icon(Icons.clear_rounded),
                  );
                },
              ),
            ),
          ),
          SizedBox(width: context.space.md),
        ],
      ),
    );
  }
}
