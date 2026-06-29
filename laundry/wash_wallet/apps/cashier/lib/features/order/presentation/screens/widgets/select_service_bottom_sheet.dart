import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SelectServiceBottomSheet extends StatefulWidget {
  final List<LaundryService> services;
  final ValueChanged<LaundryService> onServiceSelected;

  const SelectServiceBottomSheet({
    super.key,
    required this.services,
    required this.onServiceSelected,
  });

  @override
  State<SelectServiceBottomSheet> createState() =>
      _SelectServiceBottomSheetState();
}

class _SelectServiceBottomSheetState extends State<SelectServiceBottomSheet> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final query = _searchController.text.trim().toLowerCase();
    final filtered = widget.services.where((service) {
      final category = service.category?.name.toLowerCase() ?? '';
      final name = service.name.toLowerCase();
      return query.isEmpty || category.contains(query) || name.contains(query);
    }).toList();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TextField(
          controller: _searchController,
          decoration: InputDecoration(
            hintText: 'Cari layanan',
            prefixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
          ),
          onChanged: (_) => setState(() {}),
        ),
        SizedBox(height: context.space.md),
        Flexible(
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: filtered.length,
            separatorBuilder: (context, index) =>
                Divider(color: colorScheme.outlineVariant),
            itemBuilder: (context, index) {
              final service = filtered[index];
              final unitName = service.unit?.name ?? 'Unit';
              final minText = service.minQuantity > 1
                  ? 'Minimal ${service.minQuantity} $unitName'
                  : null;

              return AppListTile.service(
                title: service.name,
                subtitle: [
                  service.category?.name,
                  minText,
                ].whereType<String>().join(' - '),
                price: '${currencyFormat.format(service.price)} / $unitName',
                onTap: () {
                  widget.onServiceSelected(service);
                  Navigator.pop(context);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
