import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/print_info.dart';

sealed class PrintState extends Equatable {
  const PrintState();

  @override
  List<Object?> get props => [];
}

class PrintInitial extends PrintState {
  const PrintInitial();
}

class PrintInfoLoading extends PrintState {
  const PrintInfoLoading();
}

class PrintInfoLoaded extends PrintState {
  final PrintInfo info;
  const PrintInfoLoaded(this.info);

  @override
  List<Object?> get props => [info];
}

class PrintConfirmingReceipt extends PrintState {
  final PrintInfo info;
  const PrintConfirmingReceipt(this.info);

  @override
  List<Object?> get props => [info];
}

class PrintConfirmingLabel extends PrintState {
  final PrintInfo info;
  const PrintConfirmingLabel(this.info);

  @override
  List<Object?> get props => [info];
}

class PrintReceiptProcessing extends PrintState {
  final PrintInfo info;
  const PrintReceiptProcessing(this.info);

  @override
  List<Object?> get props => [info];
}

class PrintLabelProcessing extends PrintState {
  final PrintInfo info;
  const PrintLabelProcessing(this.info);

  @override
  List<Object?> get props => [info];
}

class PrintReceiptReady extends PrintState {
  final PrintInfo info;
  final int coinDeducted;
  final String coinSource;
  final int remainingCoin;

  const PrintReceiptReady({
    required this.info,
    required this.coinDeducted,
    required this.coinSource,
    required this.remainingCoin,
  });

  @override
  List<Object?> get props => [info, coinDeducted, coinSource, remainingCoin];
}

class PrintLabelReady extends PrintState {
  final PrintInfo info;
  final int coinDeducted;
  final String coinSource;
  final int remainingCoin;

  const PrintLabelReady({
    required this.info,
    required this.coinDeducted,
    required this.coinSource,
    required this.remainingCoin,
  });

  @override
  List<Object?> get props => [info, coinDeducted, coinSource, remainingCoin];
}

class PrintError extends PrintState {
  final Failure failure;
  final PrintInfo? info;

  const PrintError(this.failure, {this.info});

  @override
  List<Object?> get props => [failure, info];
}
