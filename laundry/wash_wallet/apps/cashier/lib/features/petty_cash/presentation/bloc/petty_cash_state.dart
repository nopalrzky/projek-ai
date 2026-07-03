import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class PettyCashState extends Equatable {
  const PettyCashState();

  @override
  List<Object?> get props => [];
}

class PettyCashInitial extends PettyCashState {
  const PettyCashInitial();
}

class PettyCashLoading extends PettyCashState {
  const PettyCashLoading();
}

class PettyCashesLoaded extends PettyCashState {
  final List<PettyCash> pettyCashes;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const PettyCashesLoaded({
    required this.pettyCashes,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  PettyCashesLoaded copyWith({
    List<PettyCash>? pettyCashes,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return PettyCashesLoaded(
      pettyCashes: pettyCashes ?? this.pettyCashes,
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
        pettyCashes,
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

class PettyCashDetailLoaded extends PettyCashState {
  final PettyCash pettyCash;

  const PettyCashDetailLoaded(this.pettyCash);

  @override
  List<Object?> get props => [pettyCash];
}

class PettyCashActionSuccess extends PettyCashState {
  final String message;
  final PettyCash? pettyCash;

  const PettyCashActionSuccess(this.message, {this.pettyCash});

  @override
  List<Object?> get props => [message, pettyCash];
}

class PettyCashFailure extends PettyCashState {
  final Failure failure;

  const PettyCashFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
