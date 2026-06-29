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

  const ServicePackagesLoaded({
    required this.packages,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  ServicePackagesLoaded copyWith({
    List<ServicePackage>? packages,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return ServicePackagesLoaded(
      packages: packages ?? this.packages,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [packages, hasReachedMax, currentPage];
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
