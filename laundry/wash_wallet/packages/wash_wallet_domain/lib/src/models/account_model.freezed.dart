// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'account_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AccountModel _$AccountModelFromJson(Map<String, dynamic> json) {
  return _AccountModel.fromJson(json);
}

/// @nodoc
mixin _$AccountModel {
  int get id => throw _privateConstructorUsedError;
  int get ownerId => throw _privateConstructorUsedError;
  int? get outletId => throw _privateConstructorUsedError;
  int? get parentId => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get slug => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  String? get subtype => throw _privateConstructorUsedError;
  String? get accountRole => throw _privateConstructorUsedError;
  int get level => throw _privateConstructorUsedError;
  bool get isSystem => throw _privateConstructorUsedError;
  bool get isTransactional => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  double get balance => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this AccountModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AccountModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AccountModelCopyWith<AccountModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AccountModelCopyWith<$Res> {
  factory $AccountModelCopyWith(
    AccountModel value,
    $Res Function(AccountModel) then,
  ) = _$AccountModelCopyWithImpl<$Res, AccountModel>;
  @useResult
  $Res call({
    int id,
    int ownerId,
    int? outletId,
    int? parentId,
    String code,
    String name,
    String? slug,
    String type,
    String? subtype,
    String? accountRole,
    int level,
    bool isSystem,
    bool isTransactional,
    bool isActive,
    double balance,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class _$AccountModelCopyWithImpl<$Res, $Val extends AccountModel>
    implements $AccountModelCopyWith<$Res> {
  _$AccountModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AccountModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? outletId = freezed,
    Object? parentId = freezed,
    Object? code = null,
    Object? name = null,
    Object? slug = freezed,
    Object? type = null,
    Object? subtype = freezed,
    Object? accountRole = freezed,
    Object? level = null,
    Object? isSystem = null,
    Object? isTransactional = null,
    Object? isActive = null,
    Object? balance = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            ownerId: null == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: freezed == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int?,
            parentId: freezed == parentId
                ? _value.parentId
                : parentId // ignore: cast_nullable_to_non_nullable
                      as int?,
            code: null == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            slug: freezed == slug
                ? _value.slug
                : slug // ignore: cast_nullable_to_non_nullable
                      as String?,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            subtype: freezed == subtype
                ? _value.subtype
                : subtype // ignore: cast_nullable_to_non_nullable
                      as String?,
            accountRole: freezed == accountRole
                ? _value.accountRole
                : accountRole // ignore: cast_nullable_to_non_nullable
                      as String?,
            level: null == level
                ? _value.level
                : level // ignore: cast_nullable_to_non_nullable
                      as int,
            isSystem: null == isSystem
                ? _value.isSystem
                : isSystem // ignore: cast_nullable_to_non_nullable
                      as bool,
            isTransactional: null == isTransactional
                ? _value.isTransactional
                : isTransactional // ignore: cast_nullable_to_non_nullable
                      as bool,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            balance: null == balance
                ? _value.balance
                : balance // ignore: cast_nullable_to_non_nullable
                      as double,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AccountModelImplCopyWith<$Res>
    implements $AccountModelCopyWith<$Res> {
  factory _$$AccountModelImplCopyWith(
    _$AccountModelImpl value,
    $Res Function(_$AccountModelImpl) then,
  ) = __$$AccountModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int ownerId,
    int? outletId,
    int? parentId,
    String code,
    String name,
    String? slug,
    String type,
    String? subtype,
    String? accountRole,
    int level,
    bool isSystem,
    bool isTransactional,
    bool isActive,
    double balance,
    DateTime? createdAt,
    DateTime? updatedAt,
  });
}

/// @nodoc
class __$$AccountModelImplCopyWithImpl<$Res>
    extends _$AccountModelCopyWithImpl<$Res, _$AccountModelImpl>
    implements _$$AccountModelImplCopyWith<$Res> {
  __$$AccountModelImplCopyWithImpl(
    _$AccountModelImpl _value,
    $Res Function(_$AccountModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AccountModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? outletId = freezed,
    Object? parentId = freezed,
    Object? code = null,
    Object? name = null,
    Object? slug = freezed,
    Object? type = null,
    Object? subtype = freezed,
    Object? accountRole = freezed,
    Object? level = null,
    Object? isSystem = null,
    Object? isTransactional = null,
    Object? isActive = null,
    Object? balance = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$AccountModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        ownerId: null == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: freezed == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int?,
        parentId: freezed == parentId
            ? _value.parentId
            : parentId // ignore: cast_nullable_to_non_nullable
                  as int?,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        slug: freezed == slug
            ? _value.slug
            : slug // ignore: cast_nullable_to_non_nullable
                  as String?,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        subtype: freezed == subtype
            ? _value.subtype
            : subtype // ignore: cast_nullable_to_non_nullable
                  as String?,
        accountRole: freezed == accountRole
            ? _value.accountRole
            : accountRole // ignore: cast_nullable_to_non_nullable
                  as String?,
        level: null == level
            ? _value.level
            : level // ignore: cast_nullable_to_non_nullable
                  as int,
        isSystem: null == isSystem
            ? _value.isSystem
            : isSystem // ignore: cast_nullable_to_non_nullable
                  as bool,
        isTransactional: null == isTransactional
            ? _value.isTransactional
            : isTransactional // ignore: cast_nullable_to_non_nullable
                  as bool,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        balance: null == balance
            ? _value.balance
            : balance // ignore: cast_nullable_to_non_nullable
                  as double,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AccountModelImpl extends _AccountModel {
  const _$AccountModelImpl({
    required this.id,
    required this.ownerId,
    this.outletId,
    this.parentId,
    required this.code,
    required this.name,
    this.slug,
    required this.type,
    this.subtype,
    this.accountRole,
    required this.level,
    this.isSystem = false,
    this.isTransactional = true,
    this.isActive = true,
    this.balance = 0.0,
    this.createdAt,
    this.updatedAt,
  }) : super._();

  factory _$AccountModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$AccountModelImplFromJson(json);

  @override
  final int id;
  @override
  final int ownerId;
  @override
  final int? outletId;
  @override
  final int? parentId;
  @override
  final String code;
  @override
  final String name;
  @override
  final String? slug;
  @override
  final String type;
  @override
  final String? subtype;
  @override
  final String? accountRole;
  @override
  final int level;
  @override
  @JsonKey()
  final bool isSystem;
  @override
  @JsonKey()
  final bool isTransactional;
  @override
  @JsonKey()
  final bool isActive;
  @override
  @JsonKey()
  final double balance;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'AccountModel(id: $id, ownerId: $ownerId, outletId: $outletId, parentId: $parentId, code: $code, name: $name, slug: $slug, type: $type, subtype: $subtype, accountRole: $accountRole, level: $level, isSystem: $isSystem, isTransactional: $isTransactional, isActive: $isActive, balance: $balance, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AccountModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.parentId, parentId) ||
                other.parentId == parentId) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.subtype, subtype) || other.subtype == subtype) &&
            (identical(other.accountRole, accountRole) ||
                other.accountRole == accountRole) &&
            (identical(other.level, level) || other.level == level) &&
            (identical(other.isSystem, isSystem) ||
                other.isSystem == isSystem) &&
            (identical(other.isTransactional, isTransactional) ||
                other.isTransactional == isTransactional) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.balance, balance) || other.balance == balance) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    ownerId,
    outletId,
    parentId,
    code,
    name,
    slug,
    type,
    subtype,
    accountRole,
    level,
    isSystem,
    isTransactional,
    isActive,
    balance,
    createdAt,
    updatedAt,
  );

  /// Create a copy of AccountModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AccountModelImplCopyWith<_$AccountModelImpl> get copyWith =>
      __$$AccountModelImplCopyWithImpl<_$AccountModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AccountModelImplToJson(this);
  }
}

abstract class _AccountModel extends AccountModel {
  const factory _AccountModel({
    required final int id,
    required final int ownerId,
    final int? outletId,
    final int? parentId,
    required final String code,
    required final String name,
    final String? slug,
    required final String type,
    final String? subtype,
    final String? accountRole,
    required final int level,
    final bool isSystem,
    final bool isTransactional,
    final bool isActive,
    final double balance,
    final DateTime? createdAt,
    final DateTime? updatedAt,
  }) = _$AccountModelImpl;
  const _AccountModel._() : super._();

  factory _AccountModel.fromJson(Map<String, dynamic> json) =
      _$AccountModelImpl.fromJson;

  @override
  int get id;
  @override
  int get ownerId;
  @override
  int? get outletId;
  @override
  int? get parentId;
  @override
  String get code;
  @override
  String get name;
  @override
  String? get slug;
  @override
  String get type;
  @override
  String? get subtype;
  @override
  String? get accountRole;
  @override
  int get level;
  @override
  bool get isSystem;
  @override
  bool get isTransactional;
  @override
  bool get isActive;
  @override
  double get balance;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of AccountModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AccountModelImplCopyWith<_$AccountModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
