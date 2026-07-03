import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/topup_cubit.dart';
import '../widgets/amount_input_card.dart';
import '../widgets/payment_method_selector.dart';

class CreateTopupScreen extends StatefulWidget {
  const CreateTopupScreen({super.key});

  @override
  State<CreateTopupScreen> createState() => _CreateTopupScreenState();
}

class _CreateTopupScreenState extends State<CreateTopupScreen> {
  final TextEditingController _amountController = TextEditingController();
  String? _selectedMethod;
  String? _selectedBank;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _handleTopup() {
    if (_amountController.text.isEmpty || _selectedMethod == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih nominal dan metode pembayaran')),
      );
      return;
    }

    if (_selectedMethod == 'bank_transfer' && _selectedBank == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Pilih bank')));
      return;
    }

    context.read<TopupCubit>().createTopup({
      'amount': int.parse(_amountController.text),
      'paymentMethod': _selectedMethod,
      'bankCode': _selectedBank,
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<TopupCubit, TopupState>(
      listener: (context, state) {
        if (state.status == TopupStatus.success &&
            state.lastCreatedTopup != null) {
          context.push('/topup/payment/${state.lastCreatedTopup!.id}');
        } else if (state.status == TopupStatus.error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.errorMessage ?? 'Gagal membuat topup'),
            ),
          );
        }
      },
      child: AppLayout(
        header: AppHeader(
          title: 'Isi Saldo',
          onBackPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/topup');
            }
          },
        ),
        body: SingleChildScrollView(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            children: [
              AmountInputCard(
                controller: _amountController,
                onAmountSelected: (_) => setState(() {}),
              ),
              SizedBox(height: context.space.lg),
              PaymentMethodSelector(
                selectedMethod: _selectedMethod,
                selectedBank: _selectedBank,
                onSelected: (method, bank) {
                  setState(() {
                    _selectedMethod = method;
                    _selectedBank = bank;
                  });
                },
              ),
              SizedBox(height: context.space.xl * 2),
            ],
          ),
        ),
        bottomBar: Container(
          padding: EdgeInsets.all(context.space.lg),
          decoration: BoxDecoration(
            color: context.colors.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(12),
                blurRadius: 10,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: BlocBuilder<TopupCubit, TopupState>(
            builder: (context, state) {
              return AppButton.primary(
                label: 'Lanjut ke Pembayaran',
                onPressed: state.isLoading ? null : _handleTopup,
                isLoading: state.isLoading,
                isFullWidth: true,
              );
            },
          ),
        ),
      ),
    );
  }
}
