// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'customer_account_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CustomerAccountModel _$CustomerAccountModelFromJson(Map<String, dynamic> json) {
  return _CustomerAccountModel.fromJson(json);
}

/// @nodoc
mixin _$CustomerAccountModel {
  int get id => throw _privateConstructorUsedError;
  String get phone => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;
  String? get dateOfBirth => throw _privateConstructorUsedError;
  bool get isVerified => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  String? get lastLoginAt => throw _privateConstructorUsedError;
  String? get fcmToken => throw _privateConstructorUsedError;
  int get depositBalance => throw _privateConstructorUsedError;
  bool? get hasPassword => throw _privateConstructorUsedError;

  /// Serializes this CustomerAccountModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CustomerAccountModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CustomerAccountModelCopyWith<CustomerAccountModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CustomerAccountModelCopyWith<$Res> {
  factory $CustomerAccountModelCopyWith(
    CustomerAccountModel value,
    $Res Function(CustomerAccountModel) then,
  ) = _$CustomerAccountModelCopyWithImpl<$Res, CustomerAccountModel>;
  @useResult
  $Res call({
    int id,
    String phone,
    String name,
    String? email,
    String? gender,
    String? avatar,
    String? dateOfBirth,
    bool isVerified,
    bool isActive,
    String? lastLoginAt,
    String? fcmToken,
    int depositBalance,
    bool? hasPassword,
  });
}

/// @nodoc
class _$CustomerAccountModelCopyWithImpl<
  $Res,
  $Val extends CustomerAccountModel
>
    implements $CustomerAccountModelCopyWith<$Res> {
  _$CustomerAccountModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CustomerAccountModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? phone = null,
    Object? name = null,
    Object? email = freezed,
    Object? gender = freezed,
    Object? avatar = freezed,
    Object? dateOfBirth = freezed,
    Object? isVerified = null,
    Object? isActive = null,
    Object? lastLoginAt = freezed,
    Object? fcmToken = freezed,
    Object? depositBalance = null,
    Object? hasPassword = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            phone: null == phone
                ? _value.phone
                : phone // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            email: freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String?,
            gender: freezed == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String?,
            avatar: freezed == avatar
                ? _value.avatar
                : avatar // ignore: cast_nullable_to_non_nullable
                      as String?,
            dateOfBirth: freezed == dateOfBirth
                ? _value.dateOfBirth
                : dateOfBirth // ignore: cast_nullable_to_non_nullable
                      as String?,
            isVerified: null == isVerified
                ? _value.isVerified
                : isVerified // ignore: cast_nullable_to_non_nullable
                      as bool,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            lastLoginAt: freezed == lastLoginAt
                ? _value.lastLoginAt
                : lastLoginAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            fcmToken: freezed == fcmToken
                ? _value.fcmToken
                : fcmToken // ignore: cast_nullable_to_non_nullable
                      as String?,
            depositBalance: null == depositBalance
                ? _value.depositBalance
                : depositBalance // ignore: cast_nullable_to_non_nullable
                      as int,
            hasPassword: freezed == hasPassword
                ? _value.hasPassword
                : hasPassword // ignore: cast_nullable_to_non_nullable
                      as bool?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CustomerAccountModelImplCopyWith<$Res>
    implements $CustomerAccountModelCopyWith<$Res> {
  factory _$$CustomerAccountModelImplCopyWith(
    _$CustomerAccountModelImpl value,
    $Res Function(_$CustomerAccountModelImpl) then,
  ) = __$$CustomerAccountModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String phone,
    String name,
    String? email,
    String? gender,
    String? avatar,
    String? dateOfBirth,
    bool isVerified,
    bool isActive,
    String? lastLoginAt,
    String? fcmToken,
    int depositBalance,
    bool? hasPassword,
  });
}

/// @nodoc
class __$$CustomerAccountModelImplCopyWithImpl<$Res>
    extends _$CustomerAccountModelCopyWithImpl<$Res, _$CustomerAccountModelImpl>
    implements _$$CustomerAccountModelImplCopyWith<$Res> {
  __$$CustomerAccountModelImplCopyWithImpl(
    _$CustomerAccountModelImpl _value,
    $Res Function(_$CustomerAccountModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CustomerAccountModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? phone = null,
    Object? name = null,
    Object? email = freezed,
    Object? gender = freezed,
    Object? avatar = freezed,
    Object? dateOfBirth = freezed,
    Object? isVerified = null,
    Object? isActive = null,
    Object? lastLoginAt = freezed,
    Object? fcmToken = freezed,
    Object? depositBalance = null,
    Object? hasPassword = freezed,
  }) {
    return _then(
      _$CustomerAccountModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        phone: null == phone
            ? _value.phone
            : phone // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        email: freezed == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String?,
        gender: freezed == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String?,
        avatar: freezed == avatar
            ? _value.avatar
            : avatar // ignore: cast_nullable_to_non_nullable
                  as String?,
        dateOfBirth: freezed == dateOfBirth
            ? _value.dateOfBirth
            : dateOfBirth // ignore: cast_nullable_to_non_nullable
                  as String?,
        isVerified: null == isVerified
            ? _value.isVerified
            : isVerified // ignore: cast_nullable_to_non_nullable
                  as bool,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        lastLoginAt: freezed == lastLoginAt
            ? _value.lastLoginAt
            : lastLoginAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        fcmToken: freezed == fcmToken
            ? _value.fcmToken
            : fcmToken // ignore: cast_nullable_to_non_nullable
                  as String?,
        depositBalance: null == depositBalance
            ? _value.depositBalance
            : depositBalance // ignore: cast_nullable_to_non_nullable
                  as int,
        hasPassword: freezed == hasPassword
            ? _value.hasPassword
            : hasPassword // ignore: cast_nullable_to_non_nullable
                  as bool?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CustomerAccountModelImpl extends _CustomerAccountModel {
  const _$CustomerAccountModelImpl({
    required this.id,
    required this.phone,
    required this.name,
    this.email,
    this.gender,
    this.avatar,
    this.dateOfBirth,
    required this.isVerified,
    required this.isActive,
    this.lastLoginAt,
    this.fcmToken,
    this.depositBalance = 0,
    this.hasPassword,
  }) : super._();

  factory _$CustomerAccountModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CustomerAccountModelImplFromJson(json);

  @override
  final int id;
  @override
  final String phone;
  @override
  final String name;
  @override
  final String? email;
  @override
  final String? gender;
  @override
  final String? avatar;
  @override
  final String? dateOfBirth;
  @override
  final bool isVerified;
  @override
  final bool isActive;
  @override
  final String? lastLoginAt;
  @override
  final String? fcmToken;
  @override
  @JsonKey()
  final int depositBalance;
  @override
  final bool? hasPassword;

  @override
  String toString() {
    return 'CustomerAccountModel(id: $id, phone: $phone, name: $name, email: $email, gender: $gender, avatar: $avatar, dateOfBirth: $dateOfBirth, isVerified: $isVerified, isActive: $isActive, lastLoginAt: $lastLoginAt, fcmToken: $fcmToken, depositBalance: $depositBalance, hasPassword: $hasPassword)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CustomerAccountModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.dateOfBirth, dateOfBirth) ||
                other.dateOfBirth == dateOfBirth) &&
            (identical(other.isVerified, isVerified) ||
                other.isVerified == isVerified) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.lastLoginAt, lastLoginAt) ||
                other.lastLoginAt == lastLoginAt) &&
            (identical(other.fcmToken, fcmToken) ||
                other.fcmToken == fcmToken) &&
            (identical(other.depositBalance, depositBalance) ||
                other.depositBalance == depositBalance) &&
            (identical(other.hasPassword, hasPassword) ||
                other.hasPassword == hasPassword));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    phone,
    name,
    email,
    gender,
    avatar,
    dateOfBirth,
    isVerified,
    isActive,
    lastLoginAt,
    fcmToken,
    depositBalance,
    hasPassword,
  );

  /// Create a copy of CustomerAccountModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CustomerAccountModelImplCopyWith<_$CustomerAccountModelImpl>
  get copyWith =>
      __$$CustomerAccountModelImplCopyWithImpl<_$CustomerAccountModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CustomerAccountModelImplToJson(this);
  }
}

abstract class _CustomerAccountModel extends CustomerAccountModel {
  const factory _CustomerAccountModel({
    required final int id,
    required final String phone,
    required final String name,
    final String? email,
    final String? gender,
    final String? avatar,
    final String? dateOfBirth,
    required final bool isVerified,
    required final bool isActive,
    final String? lastLoginAt,
    final String? fcmToken,
    final int depositBalance,
    final bool? hasPassword,
  }) = _$CustomerAccountModelImpl;
  const _CustomerAccountModel._() : super._();

  factory _CustomerAccountModel.fromJson(Map<String, dynamic> json) =
      _$CustomerAccountModelImpl.fromJson;

  @override
  int get id;
  @override
  String get phone;
  @override
  String get name;
  @override
  String? get email;
  @override
  String? get gender;
  @override
  String? get avatar;
  @override
  String? get dateOfBirth;
  @override
  bool get isVerified;
  @override
  bool get isActive;
  @override
  String? get lastLoginAt;
  @override
  String? get fcmToken;
  @override
  int get depositBalance;
  @override
  bool? get hasPassword;

  /// Create a copy of CustomerAccountModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CustomerAccountModelImplCopyWith<_$CustomerAccountModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
