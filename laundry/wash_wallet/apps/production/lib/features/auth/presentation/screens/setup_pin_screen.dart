import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../widgets/pin_box_input.dart';

class SetupPinScreen extends StatefulWidget {
  const SetupPinScreen({super.key});

  @override
  State<SetupPinScreen> createState() => _SetupPinScreenState();
}

class _SetupPinScreenState extends State<SetupPinScreen> {
  final _pinController = TextEditingController();
  String _pin = '';
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _validateAndContinue() {
    setState(() {
      _errorText = null;
    });

    if (_pin.isEmpty) {
      setState(() => _errorText = 'PIN tidak boleh kosong.');
      return;
    }
    if (_pin.length < 6) {
      setState(() => _errorText = 'PIN harus 6 digit.');
      return;
    }

    context.push('/confirm-pin', extra: {'initialPin': _pin});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup PIN')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 24),
            Image.asset('assets/images/icons/washing-machine.png', height: 120),
            const SizedBox(height: 32),
            Text(
              'Buat PIN Anda',
              style: context.typography.headlineSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Masukkan 6 digit PIN untuk mengamankan akun.',
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
