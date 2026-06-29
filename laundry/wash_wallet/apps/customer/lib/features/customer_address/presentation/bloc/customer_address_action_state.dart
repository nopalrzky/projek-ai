import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../domain/entities/customer_address.dart';

sealed class CustomerAddressActionState extends Equatable {
  const CustomerAddressActionState();

  @override
  List<Object?> get props => [];
}

class CustomerAddressActionInitial extends CustomerAddressActionState {
  const CustomerAddressActionInitial();
}

class CustomerAddressActionLoading extends CustomerAddressActionState {
  const CustomerAddressActionLoading();
}

class CustomerAddressActionSuccess extends CustomerAddressActionState {
  final String message;
  final CustomerAddress? address;

  const CustomerAddressActionSuccess(this.message, {this.address});

  @override
  List<Object?> get props => [message, address];
}

class CustomerAddressActionFailure extends CustomerAddressActionState {
  final Failure failure;

  const CustomerAddressActionFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
