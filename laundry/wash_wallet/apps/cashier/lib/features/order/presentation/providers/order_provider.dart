import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/order_remote_datasource.dart';
import '../../data/datasources/order_local_datasource.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../../domain/repositories/order_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/get_draft_usecase.dart';
import '../../domain/usecases/save_draft_usecase.dart';
import '../../domain/usecases/clear_draft_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/accept_usecase.dart';
import '../../domain/usecases/reject_usecase.dart';
import '../../domain/usecases/weigh_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/get_new_order_count_usecase.dart';
import '../bloc/order_cubit.dart';

import '../../domain/usecases/save_weighing_draft_usecase.dart';
import '../../domain/usecases/get_weighing_draft_usecase.dart';
import '../../domain/usecases/clear_weighing_draft_usecase.dart';

class OrderProvider {
  OrderProvider._();

  static OrderRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return OrderRemoteDatasourceImpl(dio, endpoints);
  }

  static OrderLocalDatasource createLocalDatasource(SharedPreferences prefs) {
    return OrderLocalDatasourceImpl(prefs);
  }

  static OrderRepository createRepository(
    OrderRemoteDatasource remote,
    OrderLocalDatasource local,
  ) {
    return OrderRepositoryImpl(remote, local);
  }

  static GetAllUsecase createGetAllUsecase(OrderRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(OrderRepository repository) {
    return GetByIdUsecase(repository);
  }

  static StoreUsecase createStoreUsecase(OrderRepository repository) {
    return StoreUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(OrderRepository repository) {
    return UpdateUsecase(repository);
  }

  static GetDraftUsecase createGetDraftUsecase(OrderRepository repository) {
    return GetDraftUsecase(repository);
  }

  static SaveDraftUsecase createSaveDraftUsecase(OrderRepository repository) {
    return SaveDraftUsecase(repository);
  }

  static ClearDraftUsecase createClearDraftUsecase(OrderRepository repository) {
    return ClearDraftUsecase(repository);
  }

  static SaveWeighingDraftUsecase createSaveWeighingDraftUsecase(
    OrderRepository repository,
  ) {
    return SaveWeighingDraftUsecase(repository);
  }

  static GetWeighingDraftUsecase createGetWeighingDraftUsecase(
    OrderRepository repository,
  ) {
    return GetWeighingDraftUsecase(repository);
  }

  static ClearWeighingDraftUsecase createClearWeighingDraftUsecase(
    OrderRepository repository,
  ) {
    return ClearWeighingDraftUsecase(repository);
  }

  static CompleteUsecase createCompleteUsecase(OrderRepository repository) {
    return CompleteUsecase(repository);
  }

  static AcceptUsecase createAcceptUsecase(OrderRepository repository) {
    return AcceptUsecase(repository);
  }

  static RejectUsecase createRejectUsecase(OrderRepository repository) {
    return RejectUsecase(repository);
  }

  static WeighUsecase createWeighUsecase(OrderRepository repository) {
    return WeighUsecase(repository);
  }

  static StartUsecase createStartUsecase(OrderRepository repository) {
    return StartUsecase(repository);
  }

  static GetNewOrderCountUsecase createGetNewOrderCountUsecase(
    OrderRepository repository,
  ) {
    return GetNewOrderCountUsecase(repository);
  }

  static OrderCubit createCubit(
    Dio dio,
    ApiEndpoints endpoints,
    SharedPreferences prefs,
  ) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final localDatasource = createLocalDatasource(prefs);
    final repository = createRepository(remoteDatasource, localDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final store = createStoreUsecase(repository);
    final update = createUpdateUsecase(repository);
    final getDraft = createGetDraftUsecase(repository);
    final saveDraft = createSaveDraftUsecase(repository);
    final clearDraft = createClearDraftUsecase(repository);
    final saveWeighingDraft = createSaveWeighingDraftUsecase(repository);
    final getWeighingDraft = createGetWeighingDraftUsecase(repository);
    final clearWeighingDraft = createClearWeighingDraftUsecase(repository);
    final complete = createCompleteUsecase(repository);
    final accept = createAcceptUsecase(repository);
    final reject = createRejectUsecase(repository);
    final weigh = createWeighUsecase(repository);
    final start = createStartUsecase(repository);
    final getNewOrderCount = createGetNewOrderCountUsecase(repository);

    return OrderCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      storeUsecase: store,
      updateUsecase: update,
      getDraftUsecase: getDraft,
      saveDraftUsecase: saveDraft,
      clearDraftUsecase: clearDraft,
      saveWeighingDraftUsecase: saveWeighingDraft,
      getWeighingDraftUsecase: getWeighingDraft,
      clearWeighingDraftUsecase: clearWeighingDraft,
      completeUsecase: complete,
      acceptUsecase: accept,
      rejectUsecase: reject,
      weighUsecase: weigh,
      startUsecase: start,
      getNewOrderCountUsecase: getNewOrderCount,
    );
  }
}
