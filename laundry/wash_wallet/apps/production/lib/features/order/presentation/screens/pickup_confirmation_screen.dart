import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';

import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';

enum PickupConfirmationMode { pickup, arrived }

class PickupConfirmationScreen extends StatefulWidget {
  final Order order;
  final PickupConfirmationMode mode;

  const PickupConfirmationScreen({
    super.key,
    required this.order,
    this.mode = PickupConfirmationMode.pickup,
  });

  @override
  State<PickupConfirmationScreen> createState() =>
      _PickupConfirmationScreenState();
}

class _PickupConfirmationScreenState extends State<PickupConfirmationScreen> {
  File? _image;
  final _picker = ImagePicker();

  bool get _isPickupMode => widget.mode == PickupConfirmationMode.pickup;

  String get _successMessage => _isPickupMode
      ? 'Pengambilan cucian berhasil dikonfirmasi'
      : 'Kedatangan di outlet berhasil dikonfirmasi';

  Future<void> _pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.camera) {
        final status = await Permission.camera.request();
        if (status.isDenied) return;
      }

      final pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (!mounted) return;

      if (pickedFile != null) {
        setState(() {
          _image = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal mengambil foto: $e')));
    }
  }

  void _confirm() {
    if (_isPickupMode && _image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan ambil foto bukti pengambilan')),
      );
      return;
    }

    if (_isPickupMode) {
      context.read<OrderCubit>().confirmPickup(widget.order.id, _image!.path);
    } else {
      context.read<OrderCubit>().confirmArrived(widget.order.id, _image?.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OrderCubit, OrderState>(
      listener: (context, state) {
        if (state is OrderDetailLoaded || state is PickupScheduleLoaded) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(_successMessage)));
          Navigator.pop(context, true);
        }
        if (state is OrderError) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        final isLoading = state is OrderLoading;

        return AppLayout(
          header: AppHeader(
            title: _isPickupMode
                ? 'Konfirmasi Pengambilan'
                : 'Konfirmasi Tiba di Outlet',
            subtitle: widget.order.orderNumber,
            onBackPressed: () => Navigator.pop(context),
            type: AppHeaderType.standard,
            showMenuButton: false,
          ),
          body: SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildOrderSummary(context),
                SizedBox(height: context.space.xl),
                Text(
                  _isPickupMode
                      ? 'Foto Bukti Pengambilan'
                      : 'Foto Bukti Tiba di Outlet',
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _isPickupMode
                      ? 'Ambil foto cucian sebagai bukti pengambilan'
                      : 'Foto saat tiba di outlet bersifat opsional',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(height: context.space.md),
                _buildImagePicker(context),
                SizedBox(height: context.space.xxl),
                AppButton.primary(
                  label: _isPickupMode
                      ? 'Konfirmasi Pengambilan'
                      : 'Konfirmasi Tiba di Outlet',
                  onPressed: isLoading ? null : _confirm,
                  isLoading: isLoading,
                  isFullWidth: true,
                  icon: Icon(
                    _isPickupMode ? Icons.check_circle : Icons.store_outlined,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOrderSummary(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(
            context,
            'Pelanggan',
            widget.order.customer?.name ?? 'Umum',
          ),
          const SizedBox(height: 12),
          _buildInfoRow(context, 'Alamat', widget.order.pickupAddress ?? '-'),
          const SizedBox(height: 12),
          _buildInfoRow(
            context,
            'Jadwal',
            widget.order.pickupSchedule != null
                ? DateFormat(
                    'EEEE, d MMM yyyy HH:mm',
                  ).format(widget.order.pickupSchedule!)
                : '-',
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildImagePicker(BuildContext context) {
    return GestureDetector(
      onTap: () => _showImageSourceActionSheet(context),
      child: Container(
        height: 240,
        width: double.infinity,
        decoration: BoxDecoration(
          color: context.colors.surfaceVariant.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(context.radius.lg),
          border: Border.all(
            color: context.colors.border,
            style: _image == null ? BorderStyle.solid : BorderStyle.none,
          ),
        ),
        child: _image != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(context.radius.lg),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.file(_image!, fit: BoxFit.cover),
                    Positioned(
                      right: 8,
                      top: 8,
                      child: GestureDetector(
                        onTap: () => setState(() => _image = null),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_a_photo_outlined,
                    size: 48,
                    color: context.colors.primary.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Tap untuk ambil foto',
                    style: context.typography.bodyMedium.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _showImageSourceActionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Kamera'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeri'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
