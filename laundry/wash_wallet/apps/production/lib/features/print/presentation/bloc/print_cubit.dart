import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/print_info.dart';
import '../../domain/usecases/get_print_info_usecase.dart';
import '../../domain/usecases/process_receipt_usecase.dart';
import '../../domain/usecases/process_label_usecase.dart';
import 'print_state.dart';

class PrintCubit extends Cubit<PrintState> {
  final GetPrintInfoUsecase _getPrintInfoUsecase;
  final ProcessReceiptUsecase _processReceiptUsecase;
  final ProcessLabelUsecase _processLabelUsecase;

  PrintCubit({
    required GetPrintInfoUsecase getPrintInfoUsecase,
    required ProcessReceiptUsecase processReceiptUsecase,
    required ProcessLabelUsecase processLabelUsecase,
  }) : _getPrintInfoUsecase = getPrintInfoUsecase,
       _processReceiptUsecase = processReceiptUsecase,
       _processLabelUsecase = processLabelUsecase,
       super(const PrintInitial());

  Future<void> getPrintInfo(int orderId) async {
    emit(const PrintInfoLoading());

    final result = await _getPrintInfoUsecase(orderId);

    result.when(
      success: (info) => emit(PrintInfoLoaded(info)),
      failure: (failure) => emit(PrintError(failure)),
    );
  }

  void requestReceipt(PrintInfo info) => emit(PrintConfirmingReceipt(info));

  void requestLabel(PrintInfo info) => emit(PrintConfirmingLabel(info));

  void cancelConfirm(PrintInfo info) => emit(PrintInfoLoaded(info));

  Future<void> processReceipt(int orderId, PrintInfo info) async {
    emit(PrintReceiptProcessing(info));

    final result = await _processReceiptUsecase(orderId);

    result.when(
      success: (data) => emit(
        PrintReceiptReady(
          info: info,
          coinDeducted: data['coin_deducted'] as int,
          coinSource: data['coin_source'] as String,
          remainingCoin: data['remaining_coin'] as int,
        ),
      ),
      failure: (failure) => emit(PrintError(failure, info: info)),
    );
  }

  Future<void> processLabel(int orderId, PrintInfo info) async {
    emit(PrintLabelProcessing(info));

    final result = await _processLabelUsecase(orderId);

    result.when(
      success: (data) => emit(
        PrintLabelReady(
          info: info,
          coinDeducted: data['coin_deducted'] as int,
          coinSource: data['coin_source'] as String,
          remainingCoin: data['remaining_coin'] as int,
        ),
      ),
      failure: (failure) => emit(PrintError(failure, info: info)),
    );
  }

  void backToLoaded(PrintInfo info) => emit(PrintInfoLoaded(info));

  void reset() => emit(const PrintInitial());
}
