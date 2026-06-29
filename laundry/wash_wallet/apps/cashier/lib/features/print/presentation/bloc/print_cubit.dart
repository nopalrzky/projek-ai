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

  Future<void> processReceipt(int orderId, PrintInfo info, {String? clientRequestId}) async {
    emit(PrintReceiptProcessing(info));

    final result = await _processReceiptUsecase.execute(ProcessReceiptParams(
      orderId: orderId,
      clientRequestId: clientRequestId,
    ));

    result.when(
      success: (data) => emit(
        PrintReceiptReady(
          info: info,
          coinDeducted: data.coinPrice,
          coinSource: data.coinSource ?? 'outlet',
          remainingCoin: data.coinSource == 'owner' ? data.ownerCoinBalance : data.outletCoinBalance,
        ),
      ),
      failure: (failure) => emit(PrintError(failure, info: info)),
    );
  }

  Future<void> processLabel(int orderId, PrintInfo info, {String? clientRequestId}) async {
    emit(PrintLabelProcessing(info));

    final result = await _processLabelUsecase.execute(ProcessLabelParams(
      orderId: orderId,
      clientRequestId: clientRequestId,
    ));

    result.when(
      success: (data) => emit(
        PrintLabelReady(
          info: info,
          coinDeducted: data.coinPrice,
          coinSource: data.coinSource ?? 'outlet',
          remainingCoin: data.coinSource == 'owner' ? data.ownerCoinBalance : data.outletCoinBalance,
        ),
      ),
      failure: (failure) => emit(PrintError(failure, info: info)),
    );
  }

  void backToLoaded(PrintInfo info) => emit(PrintInfoLoaded(info));

  void reset() => emit(const PrintInitial());
}
