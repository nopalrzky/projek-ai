import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/auth_cubit.dart';
import '../bloc/auth_state.dart';
import '../widgets/pin_box_input.dart';

class PinEntryScreen extends StatefulWidget {
  final int employeeId;
  final String username;
  final String name;

  const PinEntryScreen({
    super.key,
    required this.employeeId,
    required this.username,
    required this.name,
  });

  @override
  State<PinEntryScreen> createState() => _PinEntryScreenState();
}

class _PinEntryScreenState extends State<PinEntryScreen> {
  final _pinController = TextEditingController();
  String _pin = '';
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _validateAndSubmit() {
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

    context.read<AuthCubit>().switchEmployee(
      targetEmployeeId: widget.employeeId,
      targetUsername: widget.username,
      pin: _pin,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Masukkan PIN Kasir')),
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthFailureState) {
            setState(() {
              _errorText = 'PIN Salah: ${state.failure.message}';
              _pin = '';
              _pinController.clear();
            });
          } else if (state is SwitchPinFailure) {
            setState(() {
              _errorText = 'PIN Salah: ${state.failure.message}';
              _pin = '';
              _pinController.clear();
            });
          }
        },
        builder: (context, state) {
          final isLoading = state is SwitchPinVerifying || state is AuthLoading;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),
                Image.asset(
                  'assets/images/icons/motorcycle.png', // Just picking an icon
                  height: 120,
                ),
                const SizedBox(height: 32),
                Text(
                  'Masukkan PIN',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Login sebagai: ${widget.name}',
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
                    if (val.length == 6) {
                      _validateAndSubmit();
                    }
                  },
                  onCompleted: (_) => _validateAndSubmit(),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _validateAndSubmit,
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
                        : const Text('Lanjutkan', style: TextStyle(fontSize: 16)),
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
