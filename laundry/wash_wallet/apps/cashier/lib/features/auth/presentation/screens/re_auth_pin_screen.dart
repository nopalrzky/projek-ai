import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/auth_cubit.dart';
import '../bloc/auth_state.dart';
import '../widgets/pin_box_input.dart';

class ReAuthPinScreen extends StatefulWidget {
  const ReAuthPinScreen({super.key});

  @override
  State<ReAuthPinScreen> createState() => _ReAuthPinScreenState();
}

class _ReAuthPinScreenState extends State<ReAuthPinScreen> {
  final _pinController = TextEditingController();
  String _pin = '';
  String? _errorText;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _validateAndVerify() {
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

    context.read<AuthCubit>().verifyPin(pin: _pin);
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthCubit>().state;
    String employeeName = '';
    if (authState is AuthenticatedStale) {
      employeeName = authState.employee.name;
    } else if (authState is Authenticated) {
      employeeName = authState.employee.name;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verifikasi Sesi'),
        automaticallyImplyLeading: false, // Prevent back button
      ),
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthFailureState) {
            setState(() {
              _errorText = state.failure.message;
              _pin = '';
              _pinController.clear();
            });
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
                  'assets/images/icons/payment-method.png',
                  height: 120,
                ),
                const SizedBox(height: 32),
                Text(
                  'Sesi Tidak Aktif',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Masukkan PIN Anda untuk melanjutkan sebagai $employeeName.',
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
                  onCompleted: (_) => _validateAndVerify(),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _validateAndVerify,
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
                        : const Text(
                            'Verifikasi',
                            style: TextStyle(fontSize: 16),
                          ),
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
