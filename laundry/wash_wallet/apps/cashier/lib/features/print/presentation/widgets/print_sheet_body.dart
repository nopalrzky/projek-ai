import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../domain/entities/print_info.dart';
import '../bloc/print_cubit.dart';
import 'print_order_info_card.dart';
import 'print_type_card.dart';

class PrintSheetBody extends StatelessWidget {
  final PrintInfo info;
  final bool isProcessing;
  final bool isPrinting;

  const PrintSheetBody({
    super.key,
    required this.info,
    required this.isProcessing,
    required this.isPrinting,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = isProcessing || isPrinting;

    return Padding(
      padding: EdgeInsets.only(bottom: context.space.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          PrintOrderInfoCard(info: info),
          SizedBox(height: context.space.md),
          PrintTypeCard(
            title: 'Cetak Struk / Nota',
            icon: Icons.receipt_long,
            coinInfo: info.receipt,
            isDisabled: isDisabled,
            onPrint: () => context.read<PrintCubit>().requestReceipt(info),
          ),
          SizedBox(height: context.space.md),
          PrintTypeCard(
            title: 'Cetak Label',
            icon: Icons.label,
            coinInfo: info.label,
            isDisabled: isDisabled,
            onPrint: () => context.read<PrintCubit>().requestLabel(info),
          ),
          SizedBox(height: context.space.lg),
          AppButton.outline(
            label: 'Tutup',
            isFullWidth: true,
            onPressed: isDisabled ? null : () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }
}
