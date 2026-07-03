import 'package:equatable/equatable.dart';
import 'outlet_access.dart';

class AuthEmployee extends Equatable {
  final int id;
  final String name;
  final String username;
  final String? email;
  final String? phone;
  final int outletId;
  final List<OutletAccess> accessibleOutlets;
  final List<String> allPermissions;
  final bool hasPin;

  final String? gender;
  final String? address;

  const AuthEmployee({
    required this.id,
    required this.name,
    required this.username,
    this.email,
    this.phone,
    required this.outletId,
    required this.accessibleOutlets,
    required this.allPermissions,
    required this.hasPin,
    this.gender,
    this.address,
  });

  bool hasPermission(String key) => allPermissions.contains(key);
  bool hasAnyPermission(List<String> keys) => keys.any(allPermissions.contains);
  List<int> get accessibleOutletIds =>
      accessibleOutlets.map((o) => o.outletId).toList();

  factory AuthEmployee.fromModel(dynamic model) {
    return AuthEmployee(
      id: model.id,
      name: model.name,
      username: model.username,
      email: model.email,
      phone: model.phone,
      outletId: model.outletId,
      accessibleOutlets:
          model.accessibleOutlets
              ?.map<OutletAccess>((e) => e.toEntity())
              .toList() ??
          const [],
      allPermissions: List<String>.from(model.allPermissions ?? const []),
      hasPin: model.hasPin ?? false,
      gender: model.gender,
      address: model.address,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    username,
    email,
    phone,
    outletId,
    accessibleOutlets,
    allPermissions,
    hasPin,
    gender,
    address,
  ];
}
