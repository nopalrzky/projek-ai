import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class OutletState extends Equatable {
  const OutletState();

  @override
  List<Object?> get props => [];
}

class OutletInitial extends OutletState {
  const OutletInitial();
}

class OutletLoading extends OutletState {
  const OutletLoading();
}

class OutletsLoaded extends OutletState {
  final List<Outlet> outlets;
  final bool hasReachedMax;
  final int currentPage;
  final bool isGpsActive;
  final bool isLoadMore;

  const OutletsLoaded({
    required this.outlets,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.isGpsActive = false,
    this.isLoadMore = false,
  });

  OutletsLoaded copyWith({
    List<Outlet>? outlets,
    bool? hasReachedMax,
    int? currentPage,
    bool? isGpsActive,
    bool? isLoadMore,
  }) {
    return OutletsLoaded(
      outlets: outlets ?? this.outlets,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      isGpsActive: isGpsActive ?? this.isGpsActive,
      isLoadMore: isLoadMore ?? this.isLoadMore,
    );
  }

  @override
  List<Object?> get props => [
    outlets,
    hasReachedMax,
    currentPage,
    isGpsActive,
    isLoadMore,
  ];
}

class OutletDetailLoaded extends OutletState {
  final Outlet outlet;
  final int? selectedCategoryId;

  const OutletDetailLoaded(
    this.outlet, {
    this.selectedCategoryId,
  });

  OutletDetailLoaded copyWith({
    Outlet? outlet,
    int? selectedCategoryId,
  }) {
    return OutletDetailLoaded(
      outlet ?? this.outlet,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
    );
  }

  @override
  List<Object?> get props => [
    outlet,
    selectedCategoryId,
  ];
}

class OutletActionSuccess extends OutletState {
  final String message;
  final Outlet? outlet;

  const OutletActionSuccess(this.message, {this.outlet});

  @override
  List<Object?> get props => [message, outlet];
}

class OutletFailure extends OutletState {
  final Failure failure;

  const OutletFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
