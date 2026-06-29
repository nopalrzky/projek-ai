// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_employee_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AuthEmployeeModel _$AuthEmployeeModelFromJson(Map<String, dynamic> json) {
  return _AuthEmployeeModel.fromJson(json);
}

/// @nodoc
mixin _$AuthEmployeeModel {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  List<OutletAccessModel>? get accessibleOutlets =>
      throw _privateConstructorUsedError;
  List<String>? get allPermissions => throw _privateConstructorUsedError;
  bool get hasPin => throw _privateConstructorUsedError;

  /// Serializes this AuthEmployeeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AuthEmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AuthEmployeeModelCopyWith<AuthEmployeeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AuthEmployeeModelCopyWith<$Res> {
  factory $AuthEmployeeModelCopyWith(
    AuthEmployeeModel value,
    $Res Function(AuthEmployeeModel) then,
  ) = _$AuthEmployeeModelCopyWithImpl<$Res, AuthEmployeeModel>;
  @useResult
  $Res call({
    int id,
    String name,
    String username,
    String? email,
    String? phone,
    int outletId,
    List<OutletAccessModel>? accessibleOutlets,
    List<String>? allPermissions,
    bool hasPin,
  });
}

/// @nodoc
class _$AuthEmployeeModelCopyWithImpl<$Res, $Val extends AuthEmployeeModel>
    implements $AuthEmployeeModelCopyWith<$Res> {
  _$AuthEmployeeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AuthEmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? username = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? outletId = null,
    Object? accessibleOutlets = freezed,
    Object? allPermissions = freezed,
    Object? hasPin = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            username: null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String,
            email: freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String?,
            phone: freezed == phone
                ? _value.phone
                : phone // ignore: cast_nullable_to_non_nullable
                      as String?,
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            accessibleOutlets: freezed == accessibleOutlets
                ? _value.accessibleOutlets
                : accessibleOutlets // ignore: cast_nullable_to_non_nullable
                      as List<OutletAccessModel>?,
            allPermissions: freezed == allPermissions
                ? _value.allPermissions
                : allPermissions // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            hasPin: null == hasPin
                ? _value.hasPin
                : hasPin // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AuthEmployeeModelImplCopyWith<$Res>
    implements $AuthEmployeeModelCopyWith<$Res> {
  factory _$$AuthEmployeeModelImplCopyWith(
    _$AuthEmployeeModelImpl value,
    $Res Function(_$AuthEmployeeModelImpl) then,
  ) = __$$AuthEmployeeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    String username,
    String? email,
    String? phone,
    int outletId,
    List<OutletAccessModel>? accessibleOutlets,
    List<String>? allPermissions,
    bool hasPin,
  });
}

/// @nodoc
class __$$AuthEmployeeModelImplCopyWithImpl<$Res>
    extends _$AuthEmployeeModelCopyWithImpl<$Res, _$AuthEmployeeModelImpl>
    implements _$$AuthEmployeeModelImplCopyWith<$Res> {
  __$$AuthEmployeeModelImplCopyWithImpl(
    _$AuthEmployeeModelImpl _value,
    $Res Function(_$AuthEmployeeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthEmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? username = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? outletId = null,
    Object? accessibleOutlets = freezed,
    Object? allPermissions = freezed,
    Object? hasPin = null,
  }) {
    return _then(
      _$AuthEmployeeModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        username: null == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String,
        email: freezed == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String?,
        phone: freezed == phone
            ? _value.phone
            : phone // ignore: cast_nullable_to_non_nullable
                  as String?,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        accessibleOutlets: freezed == accessibleOutlets
            ? _value._accessibleOutlets
            : accessibleOutlets // ignore: cast_nullable_to_non_nullable
                  as List<OutletAccessModel>?,
        allPermissions: freezed == allPermissions
            ? _value._allPermissions
            : allPermissions // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        hasPin: null == hasPin
            ? _value.hasPin
            : hasPin // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AuthEmployeeModelImpl extends _AuthEmployeeModel {
  const _$AuthEmployeeModelImpl({
    required this.id,
    required this.name,
    required this.username,
    this.email,
    this.phone,
    required this.outletId,
    final List<OutletAccessModel>? accessibleOutlets,
    final List<String>? allPermissions,
    this.hasPin = false,
  }) : _accessibleOutlets = accessibleOutlets,
       _allPermissions = allPermissions,
       super._();

  factory _$AuthEmployeeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$AuthEmployeeModelImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String username;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  final int outletId;
  final List<OutletAccessModel>? _accessibleOutlets;
  @override
  List<OutletAccessModel>? get accessibleOutlets {
    final value = _accessibleOutlets;
    if (value == null) return null;
    if (_accessibleOutlets is EqualUnmodifiableListView)
      return _accessibleOutlets;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<String>? _allPermissions;
  @override
  List<String>? get allPermissions {
    final value = _allPermissions;
    if (value == null) return null;
    if (_allPermissions is EqualUnmodifiableListView) return _allPermissions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final bool hasPin;

  @override
  String toString() {
    return 'AuthEmployeeModel(id: $id, name: $name, username: $username, email: $email, phone: $phone, outletId: $outletId, accessibleOutlets: $accessibleOutlets, allPermissions: $allPermissions, hasPin: $hasPin)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AuthEmployeeModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            const DeepCollectionEquality().equals(
              other._accessibleOutlets,
              _accessibleOutlets,
            ) &&
            const DeepCollectionEquality().equals(
              other._allPermissions,
              _allPermissions,
            ) &&
            (identical(other.hasPin, hasPin) || other.hasPin == hasPin));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    username,
    email,
    phone,
    outletId,
    const DeepCollectionEquality().hash(_accessibleOutlets),
    const DeepCollectionEquality().hash(_allPermissions),
    hasPin,
  );

  /// Create a copy of AuthEmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AuthEmployeeModelImplCopyWith<_$AuthEmployeeModelImpl> get copyWith =>
      __$$AuthEmployeeModelImplCopyWithImpl<_$AuthEmployeeModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$AuthEmployeeModelImplToJson(this);
  }
}

abstract class _AuthEmployeeModel extends AuthEmployeeModel {
  const factory _AuthEmployeeModel({
    required final int id,
    required final String name,
    required final String username,
    final String? email,
    final String? phone,
    required final int outletId,
    final List<OutletAccessModel>? accessibleOutlets,
    final List<String>? allPermissions,
    final bool hasPin,
  }) = _$AuthEmployeeModelImpl;
  const _AuthEmployeeModel._() : super._();

  factory _AuthEmployeeModel.fromJson(Map<String, dynamic> json) =
      _$AuthEmployeeModelImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String get username;
  @override
  String? get email;
  @override
  String? get phone;
  @override
  int get outletId;
  @override
  List<OutletAccessModel>? get accessibleOutlets;
  @override
  List<String>? get allPermissions;
  @override
  bool get hasPin;

  /// Create a copy of AuthEmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AuthEmployeeModelImplCopyWith<_$AuthEmployeeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
