import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/auth_employee.dart';
import 'outlet_access_model.dart';

part 'auth_employee_model.freezed.dart';
part 'auth_employee_model.g.dart';

@freezed
class AuthEmployeeModel with _$AuthEmployeeModel {
  const factory AuthEmployeeModel({
    required int id,
    required String name,
    required String username,
    String? email,
    String? phone,
    required int outletId,
    List<OutletAccessModel>? accessibleOutlets,
    List<String>? allPermissions,
    @Default(false) bool hasPin,
  }) = _AuthEmployeeModel;

  const AuthEmployeeModel._();

  factory AuthEmployeeModel.fromJson(Map<String, dynamic> json) =>
      _$AuthEmployeeModelFromJson(json);

  factory AuthEmployeeModel.fromEntity(AuthEmployee entity) =>
      AuthEmployeeModel(
        id: entity.id,
        name: entity.name,
        username: entity.username,
        email: entity.email,
        phone: entity.phone,
        outletId: entity.outletId,
        accessibleOutlets: entity.accessibleOutlets
            .map((e) => OutletAccessModel.fromEntity(e))
            .toList(),
        allPermissions: entity.allPermissions,
        hasPin: entity.hasPin,
      );

  AuthEmployee toEntity() => AuthEmployee(
    id: id,
    name: name,
    username: username,
    email: email,
    phone: phone,
    outletId: outletId,
    accessibleOutlets: accessibleOutlets
            ?.map((e) => e.toEntity())
            .toList() ??
        const [],
    allPermissions: allPermissions ?? const [],
    hasPin: hasPin,
  );
}
