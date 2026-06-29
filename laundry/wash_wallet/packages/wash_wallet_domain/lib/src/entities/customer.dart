import 'package:equatable/equatable.dart';

class Customer extends Equatable {
  final int id;
  final int? outletId;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? gender;
  final DateTime? dateOfBirth;
  final bool isActive;
  final String? statusLabel;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? deletedAt;
  final int ordersCount;
  final int customerSubscriptionsCount;
  final int membershipContractsCount;

  const Customer({
    required this.id,
    this.outletId,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.gender,
    this.dateOfBirth,
    required this.isActive,
    this.statusLabel,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.ordersCount = 0,
    this.customerSubscriptionsCount = 0,
    this.membershipContractsCount = 0,
  });

  factory Customer.fromModel(dynamic model) {
    return Customer(
      id: model.id,
      outletId: model.outletId,
      name: model.name,
      email: model.email,
      phone: model.phone,
      address: model.address,
      gender: model.gender,
      dateOfBirth: model.dateOfBirth,
      isActive: model.isActive,
      statusLabel: model.statusLabel,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      ordersCount: model.ordersCount,
      customerSubscriptionsCount: model.customerSubscriptionsCount,
      membershipContractsCount: model.membershipContractsCount,
    );
  }

  @override
  List<Object?> get props => [
    id,
    outletId,
    name,
    email,
    phone,
    address,
    gender,
    dateOfBirth,
    isActive,
    statusLabel,
    createdAt,
    updatedAt,
    deletedAt,
    ordersCount,
    customerSubscriptionsCount,
    membershipContractsCount,
  ];
}
