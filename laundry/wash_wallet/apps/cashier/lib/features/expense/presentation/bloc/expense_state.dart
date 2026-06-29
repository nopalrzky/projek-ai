import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class ExpenseState extends Equatable {
  const ExpenseState();

  @override
  List<Object?> get props => [];
}

class ExpenseInitial extends ExpenseState {
  const ExpenseInitial();
}

class ExpenseLoading extends ExpenseState {
  const ExpenseLoading();
}

class ExpensesLoaded extends ExpenseState {
  final List<Expense> expenses;
  final bool hasReachedMax;
  final int currentPage;

  const ExpensesLoaded({
    required this.expenses,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  ExpensesLoaded copyWith({
    List<Expense>? expenses,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return ExpensesLoaded(
      expenses: expenses ?? this.expenses,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [expenses, hasReachedMax, currentPage];
}

class ExpenseDetailLoaded extends ExpenseState {
  final Expense expense;

  const ExpenseDetailLoaded(this.expense);

  @override
  List<Object?> get props => [expense];
}

class ExpenseActionSuccess extends ExpenseState {
  final String message;
  final Expense? expense;

  const ExpenseActionSuccess(this.message, {this.expense});

  @override
  List<Object?> get props => [message, expense];
}

class ExpenseFailure extends ExpenseState {
  final Failure failure;

  const ExpenseFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
