import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/employee.dart';
import '../helpers/json_converters.dart';
import 'outlet_access_model.dart';

part 'employee_model.freezed.dart';
part 'employee_model.g.dart';

@freezed
class EmployeeModel with _$EmployeeModel {
  const factory EmployeeModel({
    required int id,
    required String name,
    required String username,
    String? email,
    String? phone,
    String? gender,
    String? formattedGender,
    String? address,
    int? age,
    String? startDate,
    String? dateOfBirth,
    required bool isActive,
    int? outletId,
    int? cutoffDays,
    String? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    List<OutletAccessModel>? accessibleOutlets,
  }) = _EmployeeModel;

  const EmployeeModel._();

  factory EmployeeModel.fromJson(Map<String, dynamic> json) =>
      _$EmployeeModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['name'] = json['name'] ?? '';
    normalized['username'] = json['username'] ?? '';
    normalized['isActive'] = toBool(json['isActive'] ?? json['is_active']);
    normalized['outletId'] = toIntOrNull(json['outletId'] ?? json['outlet_id']);
    normalized['cutoffDays'] = toIntOrNull(
      json['cutoffDays'] ?? json['cutoff_days'],
    );
    normalized['lastLoginAt'] = json['lastLoginAt'] ?? json['last_login_at'];
    normalized['startDate'] = json['startDate'] ?? json['start_date'];
    normalized['dateOfBirth'] = json['dateOfBirth'] ?? json['date_of_birth'];
    normalized['age'] = toIntOrNull(json['age']);
    normalized['formattedGender'] =
        json['formattedGender'] ?? json['formatted_gender'];

    return normalized;
  }

  factory EmployeeModel.fromEntity(Employee entity) => EmployeeModel(
    id: entity.id,
    name: entity.name,
    username: entity.username,
    email: entity.email,
    phone: entity.phone,
    gender: entity.gender,
    formattedGender: entity.formattedGender,
    address: entity.address,
    age: entity.age,
    startDate: entity.startDate,
    dateOfBirth: entity.dateOfBirth,
    isActive: entity.isActive,
    outletId: entity.outletId,
    cutoffDays: entity.cutoffDays,
    lastLoginAt: entity.lastLoginAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    accessibleOutlets: entity.accessibleOutlets
        ?.map((e) => OutletAccessModel.fromEntity(e))
        .toList(),
  );
}

extension EmployeeModelX on EmployeeModel {
  Employee toEntity() => Employee(
    id: id,
    name: name,
    username: username,
    email: email,
    phone: phone,
    gender: gender,
    formattedGender: formattedGender,
    address: address,
    age: age,
    startDate: startDate,
    dateOfBirth: dateOfBirth,
    isActive: isActive,
    outletId: outletId,
    cutoffDays: cutoffDays,
    lastLoginAt: lastLoginAt,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    accessibleOutlets: accessibleOutlets?.map((e) => e.toEntity()).toList(),
  );
}
