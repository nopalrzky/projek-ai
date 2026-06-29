import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/print_remote_datasource.dart';
import '../../data/repositories/print_repository_impl.dart';
import '../../domain/repositories/print_repository.dart';
import '../../domain/usecases/get_print_info_usecase.dart';
import '../../domain/usecases/process_receipt_usecase.dart';
import '../../domain/usecases/process_label_usecase.dart';
import '../bloc/print_cubit.dart';

class PrintProvider {
  PrintProvider._();

  static PrintRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return PrintRemoteDatasourceImpl(dio, endpoints);
  }

  static PrintRepository createRepository(
    PrintRemoteDatasource remoteDatasource,
  ) {
    return PrintRepositoryImpl(remoteDatasource);
  }

  static GetPrintInfoUsecase createGetPrintInfoUsecase(
    PrintRepository repository,
  ) {
    return GetPrintInfoUsecase(repository);
  }

  static ProcessReceiptUsecase createProcessReceiptUsecase(
    PrintRepository repository,
  ) {
    return ProcessReceiptUsecase(repository);
  }

  static ProcessLabelUsecase createProcessLabelUsecase(
    PrintRepository repository,
  ) {
    return ProcessLabelUsecase(repository);
  }

  static PrintCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getPrintInfo = createGetPrintInfoUsecase(repository);
    final processReceipt = createProcessReceiptUsecase(repository);
    final processLabel = createProcessLabelUsecase(repository);

    return PrintCubit(
      getPrintInfoUsecase: getPrintInfo,
      processReceiptUsecase: processReceipt,
      processLabelUsecase: processLabel,
    );
  }
}
