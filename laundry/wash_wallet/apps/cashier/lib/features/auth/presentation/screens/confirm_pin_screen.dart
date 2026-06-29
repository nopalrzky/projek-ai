import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/auth_cubit.dart';
import '../bloc/auth_state.dart';
import '../widgets/pin_box_input.dart';

class ConfirmPinScreen extends StatefulWidget {
  final String initialPin;

  const ConfirmPinScreen({super.key, required this.initialPin});

  @override
  State<ConfirmPinScreen> createState() => _ConfirmPinScreenState();
}

class _ConfirmPinScreenState extends State<ConfirmPinScreen> {
  final _confirmPinController = TextEditingController();
  String _confirmPin = '';
  String? _errorText;

  @override
  void dispose() {
    _confirmPinController.dispose();
    super.dispose();
  }

  void _validateAndSave() {
    setState(() {
      _errorText = null;
    });

    if (_confirmPin.isEmpty) {
      setState(() => _errorText = 'Konfirmasi PIN tidak boleh kosong.');
      return;
    }
    if (_confirmPin.length < 6) {
      setState(() => _errorText = 'PIN harus 6 digit.');
      return;
    }
    if (_confirmPin != widget.initialPin) {
      setState(() {
        _errorText = 'PIN tidak cocok. Coba lagi.';
        _confirmPin = '';
        _confirmPinController.clear();
      });
      return;
    }

    context.read<AuthCubit>().setupPin(
      pin: widget.initialPin,
      pinConfirmation: _confirmPin,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Konfirmasi PIN')),
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthFailureState) {
            setState(() {
              _errorText = state.failure.message;
              _confirmPin = '';
              _confirmPinController.clear();
            });
          } else if (state is Authenticated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('PIN berhasil dibuat')),
            );
            if (GoRouterState.of(context).matchedLocation.startsWith('/settings')) {
              while (context.canPop()) {
                context.pop();
              }
              context.pushReplacement('/settings');
            } else {
              context.go('/home');
            }
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Image.asset(
                  'assets/images/icons/laundry.png',
                  height: 120,
                ),
                const SizedBox(height: 32),
                Text(
                  'Konfirmasi PIN Anda',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Masukkan kembali PIN yang sudah dibuat.',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                PinBoxInput(
                  controller: _confirmPinController,
                  currentValue: _confirmPin,
                  errorText: _errorText,
                  onChanged: (val) {
                    setState(() {
                      _confirmPin = val;
                      _errorText = null;
                    });
                  },
                  onCompleted: (_) => _validateAndSave(),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _validateAndSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.colors.primary,
                      foregroundColor: context.colors.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Simpan PIN', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
