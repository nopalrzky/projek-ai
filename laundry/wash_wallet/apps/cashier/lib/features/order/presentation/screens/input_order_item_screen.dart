import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class InputOrderItemScreen extends StatefulWidget {
  final LaundryService service;
  final OrderDraftItem? initialItem;

  const InputOrderItemScreen({
    super.key,
    required this.service,
    this.initialItem,
  });

  @override
  State<InputOrderItemScreen> createState() => _InputOrderItemScreenState();
}

class _InputOrderItemScreenState extends State<InputOrderItemScreen> {
  late TextEditingController _qtyController;
  late TextEditingController _notesController;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _qtyController = TextEditingController(
      text: _formatQuantity(widget.initialItem?.quantity ?? 1),
    );
    _notesController = TextEditingController(
      text: widget.initialItem?.notes ?? '',
    );
  }

  String _formatQuantity(double value) {
    if (value == value.roundToDouble()) {
      return value.toInt().toString();
    }
    return value.toString();
  }

  @override
  void dispose() {
    _qtyController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _incrementQty() {
    final current = int.tryParse(_qtyController.text) ?? 0;
    _qtyController.text = (current + 1).toString();
  }

  void _decrementQty() {
    final current = int.tryParse(_qtyController.text) ?? 0;
    if (current > 0) {
      _qtyController.text = (current - 1).toString();
    }
  }

  void _handleSave() {
    if (_formKey.currentState?.validate() ?? false) {
      final qty = int.tryParse(_qtyController.text) ?? 0;
      final notes = _notesController.text.trim();

      final item = OrderDraftItem(
        laundryServiceId: widget.service.id,
        quantity: qty.toDouble(),
        notes: notes.isNotEmpty ? notes : null,
      );

      Navigator.pop(context, item);
    }
  }

  void _handleDelete() {
    final item = OrderDraftItem(
      laundryServiceId: widget.service.id,
      quantity: 0,
    );
    Navigator.pop(context, item);
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppLayout(
      header: AppHeader(
        title: widget.service.name,
        onBackPressed: () => Navigator.pop(context),
      ),
      bottomBar: _buildBottomActions(context),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.md),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildInfoCard(context, currencyFormat),
              SizedBox(height: context.space.lg),
              Text(
                'Jumlah (${widget.service.unit?.name ?? 'Unit'})',
                style: context.typography.labelSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.sm),
              _buildQtyInput(context),
              SizedBox(height: context.space.lg),
              Text(
                'Catatan Tambahan',
                style: context.typography.labelSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.sm),
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  hintText: 'Contoh: Jangan disetrika, lipat rapi...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  filled: true,
                  fillColor: context.colors.surface,
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, NumberFormat currencyFormat) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(context.space.sm),
            decoration: BoxDecoration(
              color: context.colors.surface,
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
            child: Icon(
              Icons.local_laundry_service_outlined,
              size: 32,
              color: context.colors.primary,
            ),
          ),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Harga Satuan',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                Text(
                  currencyFormat.format(widget.service.price),
                  style: context.typography.labelMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.primary,
                  ),
                ),
                if (widget.service.durationHours > 0) ...[
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Estimasi: ${widget.service.durationHours} Jam',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQtyInput(BuildContext context) {
    return Row(
      children: [
        _buildQtyButton(context, icon: Icons.remove, onTap: _decrementQty),
        SizedBox(width: context.space.md),
        Expanded(
          child: TextFormField(
            controller: _qtyController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            validator: (value) {
              if (value == null || value.isEmpty) return 'Wajib diisi';
              final qty = int.tryParse(value);
              if (qty == null || qty < 0) return 'Tidak valid';
              return null;
            },
          ),
        ),
        SizedBox(width: context.space.md),
        _buildQtyButton(
          context,
          icon: Icons.add,
          onTap: _incrementQty,
          isPrimary: true,
        ),
      ],
    );
  }

  Widget _buildQtyButton(
    BuildContext context, {
    required IconData icon,
    required VoidCallback onTap,
    bool isPrimary = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(context.radius.lg),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: isPrimary ? context.colors.primary : context.colors.surface,
          borderRadius: BorderRadius.circular(context.radius.lg),
          border: Border.all(
            color: isPrimary ? context.colors.primary : context.colors.border,
          ),
          boxShadow: isPrimary
              ? [
                  BoxShadow(
                    color: context.colors.primary.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Icon(
          icon,
          color: isPrimary ? Colors.white : context.colors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          top: BorderSide(color: context.colors.border.withValues(alpha: 0.5)),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (widget.initialItem != null) ...[
              OutlinedButton.icon(
                onPressed: _handleDelete,
                style: OutlinedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                  side: BorderSide(color: context.colors.error),
                  foregroundColor: context.colors.error,
                ),
                icon: const Icon(Icons.delete_outline),
                label: const Text('Hapus'),
              ),
              SizedBox(width: context.space.md),
            ],
            Expanded(
              child: ElevatedButton(
                onPressed: _handleSave,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: context.colors.primary,
                  foregroundColor: Colors.white,
                ),
                child: Text(
                  widget.initialItem != null
                      ? 'Simpan Perubahan'
                      : 'Tambah ke Keranjang',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
