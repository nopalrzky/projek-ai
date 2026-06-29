import 'package:equatable/equatable.dart';

class Unit extends Equatable {
  final int id;
  final String? name;
  final String? symbol;
  final String? description;
  final bool isActive;
  final int laundryServicesCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? deletedAt;

  const Unit({
    required this.id,
    this.name,
    this.symbol,
    this.description,
    this.isActive = false,
    this.laundryServicesCount = 0,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory Unit.fromModel(dynamic model) {
    return Unit(
      id: model.id,
      name: model.name,
      symbol: model.symbol,
      description: model.description,
      isActive: model.isActive,
      laundryServicesCount: model.laundryServicesCount,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    symbol,
    description,
    isActive,
    laundryServicesCount,
    createdAt,
    updatedAt,
    deletedAt,
  ];
}
