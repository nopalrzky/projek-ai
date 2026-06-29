import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class EmployeeState extends Equatable {
  const EmployeeState();

  @override
  List<Object?> get props => [];
}

class EmployeeInitial extends EmployeeState {
  const EmployeeInitial();
}

class EmployeeLoading extends EmployeeState {
  const EmployeeLoading();
}

class EmployeesLoaded extends EmployeeState {
  final List<Employee> employees;
  final bool hasReachedMax;
  final int currentPage;

  const EmployeesLoaded(
    this.employees, {
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [employees, hasReachedMax, currentPage];
}

class EmployeeDetailLoaded extends EmployeeState {
  final Employee employee;

  const EmployeeDetailLoaded(this.employee);

  @override
  List<Object?> get props => [employee];
}

class EmployeeLoaded extends EmployeeDetailLoaded {
  const EmployeeLoaded(super.employee);
}

class EmployeeActionSuccess extends EmployeeState {
  final String message;
  final Employee employee;

  const EmployeeActionSuccess(this.message, this.employee);

  @override
  List<Object?> get props => [message, employee];
}

class EmployeeFailure extends EmployeeState {
  final Failure failure;

  const EmployeeFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
