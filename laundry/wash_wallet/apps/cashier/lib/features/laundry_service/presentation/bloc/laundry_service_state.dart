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

  const LaundryServicesLoaded({
    required this.services,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  LaundryServicesLoaded copyWith({
    List<LaundryService>? services,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return LaundryServicesLoaded(
      services: services ?? this.services,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [services, hasReachedMax, currentPage];
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
