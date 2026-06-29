import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/customer_account.dart';
import '../helpers/json_converters.dart';

part 'customer_account_model.freezed.dart';
part 'customer_account_model.g.dart';

@freezed
class CustomerAccountModel with _$CustomerAccountModel {
  const factory CustomerAccountModel({
    required int id,
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? avatar,
    String? dateOfBirth,
    required bool isVerified,
    required bool isActive,
    String? lastLoginAt,
    String? fcmToken,
    @Default(0) int depositBalance,
    bool? hasPassword,
  }) = _CustomerAccountModel;

  const CustomerAccountModel._();

  factory CustomerAccountModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerAccountModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['isVerified'] = toBool(
      json['isVerified'] ?? json['is_verified'],
    );
    normalized['isActive'] = toBool(json['isActive'] ?? json['is_active']);
    normalized['dateOfBirth'] = json['dateOfBirth'] ?? json['date_of_birth'];
    normalized['lastLoginAt'] = json['lastLoginAt'] ?? json['last_login_at'];
    normalized['fcmToken'] = json['fcmToken'] ?? json['fcm_token'];
    normalized['depositBalance'] =
        json['depositBalance'] ?? json['deposit_balance'] ?? 0;
    final rawHasPassword = json['hasPassword'] ?? json['has_password'];
    normalized['hasPassword'] = rawHasPassword != null
        ? toBool(rawHasPassword)
        : null;

    return normalized;
  }

  CustomerAccount toEntity() => CustomerAccount(
    id: id,
    phone: phone,
    name: name,
    email: email,
    gender: gender,
    avatar: avatar,
    dateOfBirth: dateOfBirth,
    isVerified: isVerified,
    isActive: isActive,
    lastLoginAt: lastLoginAt,
    fcmToken: fcmToken,
    depositBalance: depositBalance,
    hasPassword: hasPassword,
  );

  factory CustomerAccountModel.fromEntity(CustomerAccount entity) =>
      CustomerAccountModel(
        id: entity.id,
        phone: entity.phone,
        name: entity.name,
        email: entity.email,
        gender: entity.gender,
        avatar: entity.avatar,
        dateOfBirth: entity.dateOfBirth,
        isVerified: entity.isVerified,
        isActive: entity.isActive,
        lastLoginAt: entity.lastLoginAt,
        fcmToken: entity.fcmToken,
        depositBalance: entity.depositBalance,
        hasPassword: entity.hasPassword,
      );
}
