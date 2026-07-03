import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class CustomerState extends Equatable {
  const CustomerState();

  @override
  List<Object?> get props => [];
}

class CustomerInitial extends CustomerState {
  const CustomerInitial();
}

class CustomerLoading extends CustomerState {
  const CustomerLoading();
}

class CustomersLoaded extends CustomerState {
  final List<Customer> customers;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const CustomersLoaded({
    required this.customers,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  CustomersLoaded copyWith({
    List<Customer>? customers,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return CustomersLoaded(
      customers: customers ?? this.customers,
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
  List<Object?> get props =>
      [customers, hasReachedMax, currentPage, lastPage, total, from, to, perPage, isPageLoading];
}

class CustomerDetailLoaded extends CustomerState {
  final Customer customer;

  const CustomerDetailLoaded(this.customer);

  @override
  List<Object?> get props => [customer];
}

class CustomerActionSuccess extends CustomerState {
  final String message;
  final Customer? customer;

  const CustomerActionSuccess(this.message, {this.customer});

  @override
  List<Object?> get props => [message, customer];
}

class CustomerFailure extends CustomerState {
  final Failure failure;

  const CustomerFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
