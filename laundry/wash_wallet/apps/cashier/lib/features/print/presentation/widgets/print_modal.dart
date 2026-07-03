import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../core/helpers/online_guard.dart';
import '../../domain/entities/print_info.dart';
import '../bloc/print_cubit.dart';
import '../bloc/print_state.dart';
import 'widgets.dart';

Future<void> showPrintModal(
  BuildContext context, {
  required int orderId,
}) async {
  final cubit = context.read<PrintCubit>();
  cubit.reset();

  await AppBottomSheet.show<void>(
    context,
    title: 'Cetak Struk & Label',
    subtitle: 'Pilih jenis cetak dan konfirmasi pemakaian coin',
    child: BlocProvider.value(
      value: cubit,
      child: _PrintSheet(orderId: orderId),
    ),
  );

  cubit.reset();
}

class _PrintSheet extends StatefulWidget {
  final int orderId;

  const _PrintSheet({required this.orderId});

  @override
  State<_PrintSheet> createState() => _PrintSheetState();
}

class _PrintSheetState extends State<_PrintSheet> {
  bool _isPrinting = false;
  bool _confirmationOpen = false;
  late String _clientRequestId;
  bool _isInit = false;

  @override
  void initState() {
    super.initState();
    _initClientRequestId();
  }

  Future<void> _initClientRequestId() async {
    final prefs = await SharedPreferences.getInstance();
    final key = 'cashier_print_pending_${widget.orderId}';
    final savedKey = prefs.getString(key);

    if (savedKey != null) {
      _clientRequestId = savedKey;
    } else {
      _clientRequestId = IdempotencyKey.generate();
      await prefs.setString(key, _clientRequestId);
    }

    if (mounted) {
      setState(() {
        _isInit = true;
      });
      context.read<PrintCubit>().getPrintInfo(widget.orderId);
    }
  }

  @override
  void dispose() {
    SharedPreferences.getInstance().then((prefs) {
      prefs.remove('cashier_print_pending_${widget.orderId}');
    });
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PrintCubit, PrintState>(
      listener: _listenPrintState,
      child: BlocBuilder<PrintCubit, PrintState>(
        builder: (context, state) {
          final info = _readInfo(state);
          final isProcessing =
              state is PrintReceiptProcessing || state is PrintLabelProcessing;

          if (!_isInit || state is PrintInfoLoading || state is PrintInitial) {
            return const SizedBox(
              height: 320,
              child: AppLoadingIndicator(message: 'Memuat info cetak...'),
            );
          }

          if (state is PrintError && state.info == null) {
            return AppErrorState(
              message: state.failure.message,
              onRetry: () =>
                  context.read<PrintCubit>().getPrintInfo(widget.orderId),
            );
          }

          if (info == null) {
            return const SizedBox(
              height: 320,
              child: AppLoadingIndicator(message: 'Memuat info cetak...'),
            );
          }

          return PrintSheetBody(
            info: info,
            isProcessing: isProcessing,
            isPrinting: _isPrinting,
          );
        },
      ),
    );
  }

  void _listenPrintState(BuildContext context, PrintState state) {
    if (state is PrintConfirmingReceipt) {
      unawaited(
        _showConfirmationSheet(
          context,
          title: 'Cetak Struk / Nota',
          info: state.info,
          isReceipt: true,
        ),
      );
    }

    if (state is PrintConfirmingLabel) {
      unawaited(
        _showConfirmationSheet(
          context,
          title: 'Cetak Label',
          info: state.info,
          isReceipt: false,
        ),
      );
    }

    if (state is PrintReceiptReady) {
      unawaited(_handleReceiptReady(context, state.info));
    }

    if (state is PrintLabelReady) {
      unawaited(_handleLabelReady(context, state.info));
    }

    if (state is PrintError && state.info != null) {
      AppSnackbar.error(context, message: state.failure.message);
    }
  }

  Future<void> _showConfirmationSheet(
    BuildContext context, {
    required String title,
    required PrintInfo info,
    required bool isReceipt,
  }) async {
    if (_confirmationOpen) return;
    _confirmationOpen = true;
    final cubit = context.read<PrintCubit>();

    await AppBottomSheet.show<void>(
      context,
      title: 'Konfirmasi Cetak',
      subtitle: 'Coin akan dipotong saat konfirmasi',
      isDismissible: false,
      enableDrag: false,
      child: BlocProvider.value(
        value: cubit,
        child: BlocBuilder<PrintCubit, PrintState>(
          builder: (context, state) {
            final isProcessing = isReceipt
                ? state is PrintReceiptProcessing
                : state is PrintLabelProcessing;

            return PrintConfirmationSheet(
              title: title,
              coinInfo: isReceipt ? info.receipt : info.label,
              isProcessing: isProcessing,
              onConfirm: () {
                OnlineGuard.requireOnline(
                  actionName: 'Mencetak Struk/Label',
                  action: () async {
                    if (isReceipt) {
                      context.read<PrintCubit>().processReceipt(
                        widget.orderId,
                        info,
                        clientRequestId: 'receipt_$_clientRequestId',
                      );
                    } else {
                      context.read<PrintCubit>().processLabel(
                        widget.orderId,
                        info,
                        clientRequestId: 'label_$_clientRequestId',
                      );
                    }
                  },
                  onOffline: (message) =>
                      AppSnackbar.error(context, message: message),
                );
              },
              onCancel: () {
                context.read<PrintCubit>().cancelConfirm(info);
                Navigator.of(context).pop();
              },
            );
          },
        ),
      ),
    );

    _confirmationOpen = false;
    final currentState = cubit.state;
    if (currentState is PrintConfirmingReceipt ||
        currentState is PrintConfirmingLabel) {
      cubit.cancelConfirm(info);
    }
  }

  Future<void> _handleReceiptReady(BuildContext context, PrintInfo info) async {
    await _handlePrint(
      context,
      info,
      successMessage: 'Struk berhasil dicetak',
      printAction: () => _printReceipt(context, info),
    );
  }

  Future<void> _handleLabelReady(BuildContext context, PrintInfo info) async {
    await _handlePrint(
      context,
      info,
      successMessage: 'Label berhasil dicetak',
      printAction: () => _printLabel(context, info),
    );
  }

  Future<void> _handlePrint(
    BuildContext context,
    PrintInfo info, {
    required String successMessage,
    required Future<void> Function() printAction,
  }) async {
    if (_isPrinting) return;
    setState(() => _isPrinting = true);

    try {
      await printAction();
      if (!context.mounted) return;
      AppSnackbar.success(context, message: successMessage);
      _closeSheets(context);
    } catch (e) {
      if (context.mounted) {
        _closeConfirmation(context);
        AppSnackbar.error(context, message: e.toString());
        context.read<PrintCubit>().backToLoaded(info);
      }
    } finally {
      if (mounted) setState(() => _isPrinting = false);
    }
  }

  Future<void> _printReceipt(BuildContext context, PrintInfo info) {
    final printer = context.read<ThermalPrinterService>();
    return printer.printReceiptFromData(
      outletName: info.outletName,
      outletAddress: info.outletAddress,
      orderNumber: info.orderNumber,
      orderDate: info.formattedOrderDate,
      cashierName: info.cashierName,
      customerName: info.customerName,
      customerPhone: info.customerPhone,
      items: _mapItems(info),
      subtotal: info.subtotal,
      discountAmount: info.discountAmount,
      taxAmount: info.taxAmount,
      totalAmount: info.totalAmount,
      paidAmount: info.paidAmount,
      remainingAmount: info.remainingAmount,
      paymentStatus: info.paymentStatusLabel,
      estimatedCompletion: info.formattedEstimatedCompletion,
    );
  }

  Future<void> _printLabel(BuildContext context, PrintInfo info) {
    final printer = context.read<ThermalPrinterService>();
    return printer.printLabelFromData(
      outletName: info.outletName,
      orderNumber: info.orderNumber,
      orderDate: info.formattedOrderDate,
      customerName: info.customerName,
      customerPhone: info.customerPhone,
      items: _mapItems(info),
      estimatedCompletion: info.formattedEstimatedCompletion,
    );
  }

  List<PrintItemData> _mapItems(PrintInfo info) {
    return info.orderItems
        .map(
          (item) => PrintItemData(
            serviceName: item.laundryServiceName,
            quantity: item.quantity,
            unitName: item.unitName,
            unitPrice: item.unitPrice,
            totalAmount: item.totalAmount,
          ),
        )
        .toList();
  }

  void _closeSheets(BuildContext context) {
    _closeConfirmation(context);
    Navigator.of(context).pop();
  }

  void _closeConfirmation(BuildContext context) {
    if (_confirmationOpen) {
      _confirmationOpen = false;
      Navigator.of(context).pop();
    }
  }

  PrintInfo? _readInfo(PrintState state) {
    return switch (state) {
      PrintInfoLoaded(:final info) => info,
      PrintConfirmingReceipt(:final info) => info,
      PrintConfirmingLabel(:final info) => info,
      PrintReceiptProcessing(:final info) => info,
      PrintLabelProcessing(:final info) => info,
      PrintReceiptReady(:final info) => info,
      PrintLabelReady(:final info) => info,
      PrintError(:final info) => info,
      _ => null,
    };
  }
}
