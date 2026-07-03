import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class CustomerSubscriptionState extends Equatable {
  const CustomerSubscriptionState();

  @override
  List<Object?> get props => [];
}

class CustomerSubscriptionInitial extends CustomerSubscriptionState {
  const CustomerSubscriptionInitial();
}

class CustomerSubscriptionLoading extends CustomerSubscriptionState {
  const CustomerSubscriptionLoading();
}

class CustomerSubscriptionsLoaded extends CustomerSubscriptionState {
  final List<CustomerSubscription> subscriptions;
  final bool hasReachedMax;
  final int currentPage;
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const CustomerSubscriptionsLoaded({
    required this.subscriptions,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  CustomerSubscriptionsLoaded copyWith({
    List<CustomerSubscription>? subscriptions,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return CustomerSubscriptionsLoaded(
      subscriptions: subscriptions ?? this.subscriptions,
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
        subscriptions,
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

class CustomerSubscriptionDetailLoaded extends CustomerSubscriptionState {
  final CustomerSubscription subscription;

  const CustomerSubscriptionDetailLoaded(this.subscription);

  @override
  List<Object?> get props => [subscription];
}

class CustomerSubscriptionActionSuccess extends CustomerSubscriptionState {
  final String message;
  final CustomerSubscription? subscription;

  const CustomerSubscriptionActionSuccess(this.message, {this.subscription});

  @override
  List<Object?> get props => [message, subscription];
}

class CustomerSubscriptionFailure extends CustomerSubscriptionState {
  final Failure failure;

  const CustomerSubscriptionFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
