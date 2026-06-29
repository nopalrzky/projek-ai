import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_customer/features/topup/data/datasources/topup_remote_datasource.dart';

import '../../data/repositories/topup_repository_impl.dart';
import '../../domain/repositories/topup_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../bloc/topup_cubit.dart';

class TopupProviders {
  static List<RepositoryProvider> get repositoryProviders => [
    RepositoryProvider<TopupRemoteDatasource>(
      create: (context) => TopupRemoteDatasourceImpl(
        context.read<Dio>(),
        context.read<ApiEndpoints>(),
      ),
    ),
    RepositoryProvider<TopupRepository>(
      create: (context) =>
          TopupRepositoryImpl(context.read<TopupRemoteDatasource>()),
    ),
  ];

  static List<BlocProvider> get blocProviders => [
    BlocProvider<TopupCubit>(
      create: (context) => TopupCubit(
        createTopup: StoreUsecase(context.read<TopupRepository>()),
        getHistory: GetAllUsecase(context.read<TopupRepository>()),
        getDetail: GetByIdUsecase(context.read<TopupRepository>()),
      ),
    ),
  ];
}
