import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/account.dart';
import '../helpers/json_converters.dart';

part 'account_model.freezed.dart';
part 'account_model.g.dart';

@freezed
class AccountModel with _$AccountModel {
  const factory AccountModel({
    required int id,
    required int ownerId,
    int? outletId,
    int? parentId,
    required String code,
    required String name,
    String? slug,
    required String type,
    String? subtype,
    String? accountRole,
    required int level,
    @Default(false) bool isSystem,
    @Default(true) bool isTransactional,
    @Default(true) bool isActive,
    @Default(0.0) double balance,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _AccountModel;

  const AccountModel._();

  factory AccountModel.fromJson(Map<String, dynamic> json) =>
      _$AccountModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['ownerId'] = toInt(json['ownerId'] ?? json['owner_id']);
    normalized['outletId'] = (json['outletId'] ?? json['outlet_id']) != null
        ? toInt(json['outletId'] ?? json['outlet_id'])
        : null;
    normalized['parentId'] = (json['parentId'] ?? json['parent_id']) != null
        ? toInt(json['parentId'] ?? json['parent_id'])
        : null;
    normalized['level'] = toInt(json['level']);
    normalized['isSystem'] = toBool(
      json['isSystem'] ?? json['is_system'],
      defaultValue: false,
    );
    normalized['isTransactional'] = toBool(
      json['isTransactional'] ?? json['is_transactional'],
      defaultValue: true,
    );
    normalized['isActive'] = toBool(
      json['isActive'] ?? json['is_active'],
      defaultValue: true,
    );
    normalized['balance'] = toDouble(json['balance']);

    return normalized;
  }
}

extension AccountModelX on AccountModel {
  Account toEntity() => Account(
    id: id,
    ownerId: ownerId,
    outletId: outletId,
    parentId: parentId,
    code: code,
    name: name,
    slug: slug,
    type: type,
    subtype: subtype,
    accountRole: accountRole,
    level: level,
    isSystem: isSystem,
    isTransactional: isTransactional,
    isActive: isActive,
    balance: balance,
    createdAt: createdAt,
    updatedAt: updatedAt,
  );
}
