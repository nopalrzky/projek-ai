import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../domain/entities/customer_address.dart';

sealed class CustomerAddressListState extends Equatable {
  const CustomerAddressListState();

  @override
  List<Object?> get props => [];
}

class CustomerAddressListInitial extends CustomerAddressListState {
  const CustomerAddressListInitial();
}

class CustomerAddressListLoading extends CustomerAddressListState {
  const CustomerAddressListLoading();
}

class CustomerAddressListSuccess extends CustomerAddressListState {
  final List<CustomerAddress> addresses;
  final bool hasReachedMax;
  final int currentPage;

  const CustomerAddressListSuccess({
    required this.addresses,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  CustomerAddressListSuccess copyWith({
    List<CustomerAddress>? addresses,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return CustomerAddressListSuccess(
      addresses: addresses ?? this.addresses,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [addresses, hasReachedMax, currentPage];
}

class CustomerAddressListFailure extends CustomerAddressListState {
  final Failure failure;

  const CustomerAddressListFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
