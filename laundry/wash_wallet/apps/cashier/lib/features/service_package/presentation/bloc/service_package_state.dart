import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class ServicePackageState extends Equatable {
  const ServicePackageState();

  @override
  List<Object?> get props => [];
}

class ServicePackageInitial extends ServicePackageState {
  const ServicePackageInitial();
}

class ServicePackageLoading extends ServicePackageState {
  const ServicePackageLoading();
}

class ServicePackagesLoaded extends ServicePackageState {
  final List<ServicePackage> packages;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const ServicePackagesLoaded({
    required this.packages,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  ServicePackagesLoaded copyWith({
    List<ServicePackage>? packages,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return ServicePackagesLoaded(
      packages: packages ?? this.packages,
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
        packages,
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

class ServicePackageDetailLoaded extends ServicePackageState {
  final ServicePackage package;

  const ServicePackageDetailLoaded(this.package);

  @override
  List<Object?> get props => [package];
}

class ServicePackageFailure extends ServicePackageState {
  final Failure failure;

  const ServicePackageFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
