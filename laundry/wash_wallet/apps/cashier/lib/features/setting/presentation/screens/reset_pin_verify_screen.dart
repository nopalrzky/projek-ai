import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/widgets/pin_box_input.dart';

class ResetPinVerifyScreen extends StatefulWidget {
  const ResetPinVerifyScreen({super.key});

  @override
  State<ResetPinVerifyScreen> createState() => _ResetPinVerifyScreenState();
}

class _ResetPinVerifyScreenState extends State<ResetPinVerifyScreen> {
  final _pinController = TextEditingController();
  String _pin = '';
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _validateAndContinue() {
    setState(() => _errorText = null);

    if (_pin.length < 6) {
      setState(() => _errorText = 'PIN harus 6 digit.');
      return;
    }

    context.push('/settings/pin-reset-new', extra: {'currentPin': _pin});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verifikasi PIN Saat Ini')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 24),
            const SizedBox(height: 32),
            Text(
              'Masukkan PIN Saat Ini',
              style: context.typography.headlineSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Masukkan PIN Anda yang aktif untuk melanjutkan.',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            PinBoxInput(
              controller: _pinController,
              currentValue: _pin,
              errorText: _errorText,
              onChanged: (val) {
                setState(() {
                  _pin = val;
                  _errorText = null;
                });
              },
              onCompleted: (_) => _validateAndContinue(),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _validateAndContinue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.colors.primary,
                  foregroundColor: context.colors.onPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                ),
                child: const Text('Lanjutkan', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
