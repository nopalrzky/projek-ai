import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../auth/presentation/widgets/pin_box_input.dart';

class ResetPinNewScreen extends StatefulWidget {
  final String currentPin;

  const ResetPinNewScreen({super.key, required this.currentPin});

  @override
  State<ResetPinNewScreen> createState() => _ResetPinNewScreenState();
}

class _ResetPinNewScreenState extends State<ResetPinNewScreen> {
  final _newPinController = TextEditingController();
  final _confirmPinController = TextEditingController();
  String _newPin = '';
  String _confirmPin = '';
  String? _errorText;
  bool _isConfirmStep = false;

  @override
  void dispose() {
    _newPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  void _onNewPinCompleted(String pin) {
    setState(() {
      _isConfirmStep = true;
      _errorText = null;
    });
  }

  void _onConfirmPinCompleted(String pin) {
    if (_confirmPin != _newPin) {
      setState(() {
        _errorText = 'PIN tidak cocok. Coba lagi.';
        _confirmPin = '';
        _confirmPinController.clear();
      });
      return;
    }
    _submitReset();
  }

  void _submitReset() {
    context.read<AuthCubit>().resetPin(
          currentPin: widget.currentPin,
          pin: _newPin,
          pinConfirmation: _confirmPin,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listenWhen: (prev, curr) =>
          curr is PinResetSuccess || curr is AuthFailureState,
      listener: (context, state) {
        if (state is PinResetSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('PIN berhasil diubah')),
          );
          while (context.canPop()) {
            context.pop();
          }
          context.go('/settings');
        } else if (state is AuthFailureState) {
          setState(() {
            _errorText = state.failure.message;
            _newPin = '';
            _confirmPin = '';
            _isConfirmStep = false;
            _newPinController.clear();
            _confirmPinController.clear();
          });
        }
      },
      builder: (context, state) {
        final isLoading = state is PinResetVerifying;

        return Scaffold(
          appBar: AppBar(
            title: Text(
                _isConfirmStep ? 'Konfirmasi PIN Baru' : 'Buat PIN Baru'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Text(
                  _isConfirmStep ? 'Konfirmasi PIN Baru' : 'Masukkan PIN Baru',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  _isConfirmStep
                      ? 'Masukkan kembali PIN baru untuk konfirmasi.'
                      : 'Masukkan 6 digit PIN baru Anda.',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                if (!_isConfirmStep)
                  PinBoxInput(
                    controller: _newPinController,
                    currentValue: _newPin,
                    errorText: _errorText,
                    onChanged: (val) {
                      setState(() {
                        _newPin = val;
                        _errorText = null;
                      });
                    },
                    onCompleted: _onNewPinCompleted,
                  )
                else
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
                    onCompleted: _onConfirmPinCompleted,
                  ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            if (!_isConfirmStep) {
                              _onNewPinCompleted(_newPin);
                            } else {
                              _onConfirmPinCompleted(_confirmPin);
                            }
                          },
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
                        : Text(
                            _isConfirmStep ? 'Simpan PIN Baru' : 'Lanjutkan',
                            style: const TextStyle(fontSize: 16),
                          ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
