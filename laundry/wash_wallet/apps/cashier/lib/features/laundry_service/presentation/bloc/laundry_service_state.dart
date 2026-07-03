import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class LaundryServiceState extends Equatable {
  const LaundryServiceState();

  @override
  List<Object?> get props => [];
}

class LaundryServiceInitial extends LaundryServiceState {
  const LaundryServiceInitial();
}

class LaundryServiceLoading extends LaundryServiceState {
  const LaundryServiceLoading();
}

class LaundryServicesLoaded extends LaundryServiceState {
  final List<LaundryService> services;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const LaundryServicesLoaded({
    required this.services,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  LaundryServicesLoaded copyWith({
    List<LaundryService>? services,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return LaundryServicesLoaded(
      services: services ?? this.services,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      lastPage: lastPage ?? this.lastPage,
      total: total ?? this.total,
      from: from ?? this.from,
      to: to ?? this.to,
      perPage: perPage ?? this.perPage,
      isPageLoading: isPageLoading ?? this.isPageLoading,
    );
  }

  @override
  List<Object?> get props => [
        services,
        hasReachedMax,
        currentPage,
        lastPage,
        total,
        from,
        to,
        perPage,
        isPageLoading,
      ];
}

class LaundryServiceDetailLoaded extends LaundryServiceState {
  final LaundryService service;

  const LaundryServiceDetailLoaded({required this.service});

  @override
  List<Object?> get props => [service];
}

class LaundryServiceActionSuccess extends LaundryServiceState {
  final String message;
  final LaundryService? service;

  const LaundryServiceActionSuccess(this.message, {this.service});

  @override
  List<Object?> get props => [message, service];
}

class LaundryServiceFailure extends LaundryServiceState {
  final Failure failure;

  const LaundryServiceFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
