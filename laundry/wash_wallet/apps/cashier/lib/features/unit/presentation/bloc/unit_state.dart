import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class UnitState extends Equatable {
  const UnitState();

  @override
  List<Object?> get props => [];
}

class UnitInitial extends UnitState {
  const UnitInitial();
}

class UnitLoading extends UnitState {
  const UnitLoading();
}

class UnitsLoaded extends UnitState {
  final List<Unit> units;
  final bool hasReachedMax;
  final int currentPage;

  const UnitsLoaded({
    required this.units,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  UnitsLoaded copyWith({
    List<Unit>? units,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return UnitsLoaded(
      units: units ?? this.units,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [units, hasReachedMax, currentPage];
}

class UnitFailure extends UnitState {
  final Failure failure;

  const UnitFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
