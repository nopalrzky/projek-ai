import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_gallery_saver_plus/image_gallery_saver_plus.dart';
import 'package:dio/dio.dart';

class PaymentInstructionCard extends StatelessWidget {
  final CustomerTopup topup;

  const PaymentInstructionCard({super.key, required this.topup});

  @override
  Widget build(BuildContext context) {
    final data = topup.paymentData ?? {};
    final method = topup.paymentMethod;

    return AppCard.elevated(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          Divider(height: context.space.xl),
          if (method == 'bank_transfer' || method == 'permata')
            _buildVaInstruction(context, data),
          if (method == 'qris') _buildQrInstruction(context, data),
          if (method == 'gopay' || method == 'shopeepay')
            _buildEwalletInstruction(context, data),
          SizedBox(height: context.space.md),
          _buildInstructionsText(context, data),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Total Pembayaran',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              'Rp ${topup.amount}',
              style: context.typography.headlineSmall.copyWith(
                color: context.colors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        AppBadge.warning(label: 'Pending'),
      ],
    );
  }

  Widget _buildVaInstruction(BuildContext context, Map data) {
    final va = data['va_number'] ?? data['bill_key'] ?? '';
    final bank = data['bank'] ?? 'Bank Transfer';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Virtual Account $bank',
          style: context.typography.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.sm),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: EdgeInsets.all(context.space.md),
                decoration: BoxDecoration(
                  color: context.colors.surface,
                  border: Border.all(color: context.colors.border),
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
                child: Text(
                  va,
                  style: context.typography.headlineLarge.copyWith(
                    letterSpacing: 2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            SizedBox(width: context.space.sm),
            IconButton(
              onPressed: () {
                Clipboard.setData(ClipboardData(text: va));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Nomor VA berhasil disalin')),
                );
              },
              icon: Icon(Icons.copy_rounded, color: context.colors.primary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQrInstruction(BuildContext context, Map data) {
    final qrUrl = data['qr_url'];
    if (qrUrl == null) return const SizedBox.shrink();

    return Column(
      children: [
        Text(
          'Scan QR Code',
          style: context.typography.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.md),
        Center(
          child: Image.network(
            qrUrl,
            width: 250,
            height: 250,
            errorBuilder: (context, error, stackTrace) =>
                const Icon(Icons.broken_image, size: 100),
          ),
        ),
        SizedBox(height: context.space.md),
        AppButton.outline(
          label: 'Simpan QR Code',
          onPressed: () => _downloadQr(context, qrUrl),
          isFullWidth: true,
          icon: const Icon(Icons.download_rounded),
        ),
      ],
    );
  }

  Future<void> _downloadQr(BuildContext context, String url) async {
    try {
      final status = await Permission.photos.request();
      if (status.isDenied) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Izin akses galeri ditolak')),
          );
        }
        return;
      }

      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Mengunduh QR Code...')));
      }

      final response = await Dio().get(
        url,
        options: Options(responseType: ResponseType.bytes),
      );

      final result = await ImageGallerySaverPlus.saveImage(
        Uint8List.fromList(response.data),
        quality: 100,
        name: "topup_qr_${DateTime.now().millisecondsSinceEpoch}",
      );

      if (context.mounted) {
        if (result['isSuccess']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('QR Code berhasil disimpan ke galeri'),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal menyimpan QR Code')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Widget _buildEwalletInstruction(BuildContext context, Map data) {
    final deeplink = data['deeplink_url'];
    if (deeplink == null) return _buildQrInstruction(context, data);

    return Column(
      children: [
        AppButton.primary(
          label: 'Buka Aplikasi ${topup.paymentMethod.toUpperCase()}',
          onPressed: () async {
            final url = Uri.parse(deeplink);
            if (await canLaunchUrl(url)) {
              await launchUrl(url);
            }
          },
          isFullWidth: true,
        ),
        SizedBox(height: context.space.md),
        const Text('Atau scan QR di bawah ini:'),
        _buildQrInstruction(context, data),
      ],
    );
  }

  Widget _buildInstructionsText(BuildContext context, Map data) {
    final instruction = data['instructions'] ?? '';
    if (instruction.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.infoSurface,
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, size: 20, color: context.colors.info),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              instruction,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.info,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
