import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'models/active_filter.dart';
import 'models/filter_config.dart';

class FilterPanel extends StatefulWidget {
  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(List<ActiveFilter> applied) onApply;
  final VoidCallback onCancel;
  final VoidCallback onClearAll;

  const FilterPanel({
    super.key,
    required this.filterConfigs,
    required this.activeFilters,
    required this.onApply,
    required this.onCancel,
    required this.onClearAll,
  });

  @override
  State<FilterPanel> createState() => _FilterPanelState();
}

class _FilterPanelState extends State<FilterPanel> {
  late Map<String, dynamic> _pendingValues;

  @override
  void initState() {
    super.initState();
    _pendingValues = {};
    for (final filter in widget.activeFilters) {
      _pendingValues[filter.filterId] = filter.value;
    }
  }

  void _apply() {
    final appliedFilters = <ActiveFilter>[];
    for (final config in widget.filterConfigs) {
      final value = _pendingValues[config.id];
      if (value != null) {
        String valueLabel = '-';
        if (config.type == FilterType.singleSelect) {
          final option = config.options.firstWhere(
            (o) => o.value == value,
            orElse: () => config.options.first,
          );
          valueLabel = option.label;
        } else if (config.type == FilterType.dateRange) {
          final map = value as Map;
          final from = map['from'] ?? '...';
          final to = map['to'] ?? '...';
          valueLabel = '$from - $to';
        } else if (config.type == FilterType.numberRange) {
          final map = value as Map;
          final min = map['min'] != null ? _formatCurrency(map['min'] as double) : '...';
          final max = map['max'] != null ? _formatCurrency(map['max'] as double) : '...';
          valueLabel = '$min - $max';
        }
        
        appliedFilters.add(ActiveFilter(
          filterId: config.id,
          filterLabel: config.label,
          valueLabel: valueLabel,
          value: value,
        ));
      }
    }
    widget.onApply(appliedFilters);
  }

  String _formatCurrency(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }

  Widget _buildFilterSection(FilterConfig config) {
    switch (config.type) {
      case FilterType.singleSelect:
        return _buildSingleSelect(config);
      case FilterType.dateRange:
        return _buildDateRange(config);
      case FilterType.numberRange:
        return _buildNumberRange(config);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildSingleSelect(FilterConfig config) {
    final currentValue = _pendingValues[config.id];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(config.label, style: context.typography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
        SizedBox(height: context.space.sm),
        Wrap(
          spacing: context.space.sm,
          runSpacing: context.space.sm,
          children: config.options.map((option) {
            final isSelected = currentValue == option.value;
            return ChoiceChip(
              label: Text(option.label),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _pendingValues[config.id] = option.value;
                  } else {
                    _pendingValues.remove(config.id);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDateRange(FilterConfig config) {
    final mapValue = (_pendingValues[config.id] as Map?) ?? {};
    final fromDate = mapValue['from'] as String?;
    final toDate = mapValue['to'] as String?;

    final inputDecorationFrom = InputDecoration(
      hintText: config.fromHint ?? 'Dari tanggal',
      suffixIcon: const Icon(Icons.calendar_today, size: 16),
      isDense: true,
      filled: true,
      fillColor: context.colors.surfaceSubtle,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.primary, width: 1.5),
      ),
    );

    final inputDecorationTo = InputDecoration(
      hintText: config.toHint ?? 'Sampai tanggal',
      suffixIcon: const Icon(Icons.calendar_today, size: 16),
      isDense: true,
      filled: true,
      fillColor: context.colors.surfaceSubtle,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.primary, width: 1.5),
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(config.label, style: context.typography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
        SizedBox(height: context.space.sm),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                readOnly: true,
                controller: TextEditingController(text: fromDate),
                decoration: inputDecorationFrom,
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2000),
                    lastDate: DateTime(2100),
                  );
                  if (date != null && mounted) {
                    setState(() {
                      final currentMap = Map.from((_pendingValues[config.id] as Map?) ?? {});
                      final formatted = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                      currentMap['from'] = formatted;
                      _pendingValues[config.id] = currentMap;
                    });
                  }
                },
              ),
            ),
            SizedBox(width: context.space.sm),
            const Text('-'),
            SizedBox(width: context.space.sm),
            Expanded(
              child: TextFormField(
                readOnly: true,
                controller: TextEditingController(text: toDate),
                decoration: inputDecorationTo,
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2000),
                    lastDate: DateTime(2100),
                  );
                  if (date != null && mounted) {
                    setState(() {
                      final currentMap = Map.from((_pendingValues[config.id] as Map?) ?? {});
                      final formatted = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                      currentMap['to'] = formatted;
                      _pendingValues[config.id] = currentMap;
                    });
                  }
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNumberRange(FilterConfig config) {
    final mapValue = (_pendingValues[config.id] as Map?) ?? {};
    final minVal = mapValue['min'] as double?;
    final maxVal = mapValue['max'] as double?;

    final inputDecorationMin = InputDecoration(
      hintText: config.fromHint ?? 'Nominal min',
      isDense: true,
      filled: true,
      fillColor: context.colors.surfaceSubtle,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.primary, width: 1.5),
      ),
    );

    final inputDecorationMax = InputDecoration(
      hintText: config.toHint ?? 'Nominal max',
      isDense: true,
      filled: true,
      fillColor: context.colors.surfaceSubtle,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.outlineVariant),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        borderSide: BorderSide(color: context.colors.primary, width: 1.5),
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(config.label, style: context.typography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
        SizedBox(height: context.space.sm),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                keyboardType: TextInputType.number,
                initialValue: minVal?.toStringAsFixed(0),
                decoration: inputDecorationMin,
                onChanged: (val) {
                  final parsed = double.tryParse(val);
                  final currentMap = Map.from((_pendingValues[config.id] as Map?) ?? {});
                  if (parsed != null) {
                    currentMap['min'] = parsed;
                  } else {
                    currentMap.remove('min');
                  }
                  if (currentMap.isEmpty) {
                    _pendingValues.remove(config.id);
                  } else {
                    _pendingValues[config.id] = currentMap;
                  }
                },
              ),
            ),
            SizedBox(width: context.space.sm),
            const Text('-'),
            SizedBox(width: context.space.sm),
            Expanded(
              child: TextFormField(
                keyboardType: TextInputType.number,
                initialValue: maxVal?.toStringAsFixed(0),
                decoration: inputDecorationMax,
                onChanged: (val) {
                  final parsed = double.tryParse(val);
                  final currentMap = Map.from((_pendingValues[config.id] as Map?) ?? {});
                  if (parsed != null) {
                    currentMap['max'] = parsed;
                  } else {
                    currentMap.remove('max');
                  }
                  if (currentMap.isEmpty) {
                    _pendingValues.remove(config.id);
                  } else {
                    _pendingValues[config.id] = currentMap;
                  }
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(color: context.colors.outlineVariant),
        ),
      ),
      padding: EdgeInsets.all(context.space.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              final isCompact = constraints.maxWidth < 600;
              
              final widgets = widget.filterConfigs.map((config) {
                return SizedBox(
                  width: isCompact ? constraints.maxWidth : (constraints.maxWidth / 2) - 8,
                  child: Padding(
                    padding: EdgeInsets.only(bottom: context.space.md),
                    child: _buildFilterSection(config),
                  ),
                );
              }).toList();

              return Wrap(
                spacing: context.space.md,
                children: widgets,
              );
            },
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              TextButton(
                onPressed: widget.onCancel,
                child: const Text('Batal'),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  setState(() {
                    _pendingValues.clear();
                  });
                  widget.onClearAll();
                },
                child: const Text('Hapus Semua'),
              ),
              SizedBox(width: context.space.sm),
              FilledButton(
                onPressed: _apply,
                child: const Text('Terapkan'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
