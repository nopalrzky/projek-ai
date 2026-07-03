import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final int? activeOutletId;
  final String? activeOutletName;
  final Set<int> activeServices;
  final Set<int> nonCourierServiceIds;

  const CartState({
    this.activeOutletId,
    this.activeOutletName,
    required this.activeServices,
    this.nonCourierServiceIds = const {},
  });

  int get totalItems => activeServices.length;
  bool get hasItems => activeServices.isNotEmpty;
  bool get hasNonCourierServices => nonCourierServiceIds.isNotEmpty;
  bool get canUseCourier => nonCourierServiceIds.isEmpty;

  CartState copyWith({
    int? activeOutletId,
    String? activeOutletName,
    Set<int>? activeServices,
    Set<int>? nonCourierServiceIds,
  }) {
    if (this is CartLoaded) {
      return CartLoaded(
        activeOutletId: activeOutletId ?? this.activeOutletId,
        activeOutletName: activeOutletName ?? this.activeOutletName,
        activeServices: activeServices ?? this.activeServices,
        nonCourierServiceIds: nonCourierServiceIds ?? this.nonCourierServiceIds,
      );
    }
    return CartState(
      activeOutletId: activeOutletId ?? this.activeOutletId,
      activeOutletName: activeOutletName ?? this.activeOutletName,
      activeServices: activeServices ?? this.activeServices,
      nonCourierServiceIds: nonCourierServiceIds ?? this.nonCourierServiceIds,
    );
  }

  @override
  List<Object?> get props => [
    activeOutletId,
    activeOutletName,
    activeServices,
    nonCourierServiceIds,
  ];
}

class CartInitial extends CartState {
  const CartInitial()
    : super(activeServices: const {}, nonCourierServiceIds: const {});
}

class CartLoaded extends CartState {
  const CartLoaded({
    super.activeOutletId,
    super.activeOutletName,
    required super.activeServices,
    super.nonCourierServiceIds = const {},
  });
}
