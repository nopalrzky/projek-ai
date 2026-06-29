// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'employee_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

EmployeeModel _$EmployeeModelFromJson(Map<String, dynamic> json) {
  return _EmployeeModel.fromJson(json);
}

/// @nodoc
mixin _$EmployeeModel {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get formattedGender => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  int? get age => throw _privateConstructorUsedError;
  String? get startDate => throw _privateConstructorUsedError;
  String? get dateOfBirth => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  int? get outletId => throw _privateConstructorUsedError;
  int? get cutoffDays => throw _privateConstructorUsedError;
  String? get lastLoginAt => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  DateTime? get deletedAt => throw _privateConstructorUsedError;
  List<OutletAccessModel>? get accessibleOutlets =>
      throw _privateConstructorUsedError;

  /// Serializes this EmployeeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of EmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $EmployeeModelCopyWith<EmployeeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $EmployeeModelCopyWith<$Res> {
  factory $EmployeeModelCopyWith(
    EmployeeModel value,
    $Res Function(EmployeeModel) then,
  ) = _$EmployeeModelCopyWithImpl<$Res, EmployeeModel>;
  @useResult
  $Res call({
    int id,
    String name,
    String username,
    String? email,
    String? phone,
    String? gender,
    String? formattedGender,
    String? address,
    int? age,
    String? startDate,
    String? dateOfBirth,
    bool isActive,
    int? outletId,
    int? cutoffDays,
    String? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    List<OutletAccessModel>? accessibleOutlets,
  });
}

/// @nodoc
class _$EmployeeModelCopyWithImpl<$Res, $Val extends EmployeeModel>
    implements $EmployeeModelCopyWith<$Res> {
  _$EmployeeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of EmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? username = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? gender = freezed,
    Object? formattedGender = freezed,
    Object? address = freezed,
    Object? age = freezed,
    Object? startDate = freezed,
    Object? dateOfBirth = freezed,
    Object? isActive = null,
    Object? outletId = freezed,
    Object? cutoffDays = freezed,
    Object? lastLoginAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? accessibleOutlets = freezed,
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
            gender: freezed == gender
                ? _value.gender
                : gender // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedGender: freezed == formattedGender
                ? _value.formattedGender
                : formattedGender // ignore: cast_nullable_to_non_nullable
                      as String?,
            address: freezed == address
                ? _value.address
                : address // ignore: cast_nullable_to_non_nullable
                      as String?,
            age: freezed == age
                ? _value.age
                : age // ignore: cast_nullable_to_non_nullable
                      as int?,
            startDate: freezed == startDate
                ? _value.startDate
                : startDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            dateOfBirth: freezed == dateOfBirth
                ? _value.dateOfBirth
                : dateOfBirth // ignore: cast_nullable_to_non_nullable
                      as String?,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            outletId: freezed == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int?,
            cutoffDays: freezed == cutoffDays
                ? _value.cutoffDays
                : cutoffDays // ignore: cast_nullable_to_non_nullable
                      as int?,
            lastLoginAt: freezed == lastLoginAt
                ? _value.lastLoginAt
                : lastLoginAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            deletedAt: freezed == deletedAt
                ? _value.deletedAt
                : deletedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            accessibleOutlets: freezed == accessibleOutlets
                ? _value.accessibleOutlets
                : accessibleOutlets // ignore: cast_nullable_to_non_nullable
                      as List<OutletAccessModel>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$EmployeeModelImplCopyWith<$Res>
    implements $EmployeeModelCopyWith<$Res> {
  factory _$$EmployeeModelImplCopyWith(
    _$EmployeeModelImpl value,
    $Res Function(_$EmployeeModelImpl) then,
  ) = __$$EmployeeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String name,
    String username,
    String? email,
    String? phone,
    String? gender,
    String? formattedGender,
    String? address,
    int? age,
    String? startDate,
    String? dateOfBirth,
    bool isActive,
    int? outletId,
    int? cutoffDays,
    String? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    List<OutletAccessModel>? accessibleOutlets,
  });
}

/// @nodoc
class __$$EmployeeModelImplCopyWithImpl<$Res>
    extends _$EmployeeModelCopyWithImpl<$Res, _$EmployeeModelImpl>
    implements _$$EmployeeModelImplCopyWith<$Res> {
  __$$EmployeeModelImplCopyWithImpl(
    _$EmployeeModelImpl _value,
    $Res Function(_$EmployeeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of EmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? username = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? gender = freezed,
    Object? formattedGender = freezed,
    Object? address = freezed,
    Object? age = freezed,
    Object? startDate = freezed,
    Object? dateOfBirth = freezed,
    Object? isActive = null,
    Object? outletId = freezed,
    Object? cutoffDays = freezed,
    Object? lastLoginAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? accessibleOutlets = freezed,
  }) {
    return _then(
      _$EmployeeModelImpl(
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
        gender: freezed == gender
            ? _value.gender
            : gender // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedGender: freezed == formattedGender
            ? _value.formattedGender
            : formattedGender // ignore: cast_nullable_to_non_nullable
                  as String?,
        address: freezed == address
            ? _value.address
            : address // ignore: cast_nullable_to_non_nullable
                  as String?,
        age: freezed == age
            ? _value.age
            : age // ignore: cast_nullable_to_non_nullable
                  as int?,
        startDate: freezed == startDate
            ? _value.startDate
            : startDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        dateOfBirth: freezed == dateOfBirth
            ? _value.dateOfBirth
            : dateOfBirth // ignore: cast_nullable_to_non_nullable
                  as String?,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        outletId: freezed == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int?,
        cutoffDays: freezed == cutoffDays
            ? _value.cutoffDays
            : cutoffDays // ignore: cast_nullable_to_non_nullable
                  as int?,
        lastLoginAt: freezed == lastLoginAt
            ? _value.lastLoginAt
            : lastLoginAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        deletedAt: freezed == deletedAt
            ? _value.deletedAt
            : deletedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        accessibleOutlets: freezed == accessibleOutlets
            ? _value._accessibleOutlets
            : accessibleOutlets // ignore: cast_nullable_to_non_nullable
                  as List<OutletAccessModel>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$EmployeeModelImpl extends _EmployeeModel {
  const _$EmployeeModelImpl({
    required this.id,
    required this.name,
    required this.username,
    this.email,
    this.phone,
    this.gender,
    this.formattedGender,
    this.address,
    this.age,
    this.startDate,
    this.dateOfBirth,
    required this.isActive,
    this.outletId,
    this.cutoffDays,
    this.lastLoginAt,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    final List<OutletAccessModel>? accessibleOutlets,
  }) : _accessibleOutlets = accessibleOutlets,
       super._();

  factory _$EmployeeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$EmployeeModelImplFromJson(json);

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
  final String? gender;
  @override
  final String? formattedGender;
  @override
  final String? address;
  @override
  final int? age;
  @override
  final String? startDate;
  @override
  final String? dateOfBirth;
  @override
  final bool isActive;
  @override
  final int? outletId;
  @override
  final int? cutoffDays;
  @override
  final String? lastLoginAt;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final DateTime? deletedAt;
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

  @override
  String toString() {
    return 'EmployeeModel(id: $id, name: $name, username: $username, email: $email, phone: $phone, gender: $gender, formattedGender: $formattedGender, address: $address, age: $age, startDate: $startDate, dateOfBirth: $dateOfBirth, isActive: $isActive, outletId: $outletId, cutoffDays: $cutoffDays, lastLoginAt: $lastLoginAt, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, accessibleOutlets: $accessibleOutlets)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$EmployeeModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.formattedGender, formattedGender) ||
                other.formattedGender == formattedGender) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.age, age) || other.age == age) &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.dateOfBirth, dateOfBirth) ||
                other.dateOfBirth == dateOfBirth) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.cutoffDays, cutoffDays) ||
                other.cutoffDays == cutoffDays) &&
            (identical(other.lastLoginAt, lastLoginAt) ||
                other.lastLoginAt == lastLoginAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt) &&
            const DeepCollectionEquality().equals(
              other._accessibleOutlets,
              _accessibleOutlets,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    name,
    username,
    email,
    phone,
    gender,
    formattedGender,
    address,
    age,
    startDate,
    dateOfBirth,
    isActive,
    outletId,
    cutoffDays,
    lastLoginAt,
    createdAt,
    updatedAt,
    deletedAt,
    const DeepCollectionEquality().hash(_accessibleOutlets),
  ]);

  /// Create a copy of EmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$EmployeeModelImplCopyWith<_$EmployeeModelImpl> get copyWith =>
      __$$EmployeeModelImplCopyWithImpl<_$EmployeeModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$EmployeeModelImplToJson(this);
  }
}

abstract class _EmployeeModel extends EmployeeModel {
  const factory _EmployeeModel({
    required final int id,
    required final String name,
    required final String username,
    final String? email,
    final String? phone,
    final String? gender,
    final String? formattedGender,
    final String? address,
    final int? age,
    final String? startDate,
    final String? dateOfBirth,
    required final bool isActive,
    final int? outletId,
    final int? cutoffDays,
    final String? lastLoginAt,
    final DateTime? createdAt,
    final DateTime? updatedAt,
    final DateTime? deletedAt,
    final List<OutletAccessModel>? accessibleOutlets,
  }) = _$EmployeeModelImpl;
  const _EmployeeModel._() : super._();

  factory _EmployeeModel.fromJson(Map<String, dynamic> json) =
      _$EmployeeModelImpl.fromJson;

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
  String? get gender;
  @override
  String? get formattedGender;
  @override
  String? get address;
  @override
  int? get age;
  @override
  String? get startDate;
  @override
  String? get dateOfBirth;
  @override
  bool get isActive;
  @override
  int? get outletId;
  @override
  int? get cutoffDays;
  @override
  String? get lastLoginAt;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  DateTime? get deletedAt;
  @override
  List<OutletAccessModel>? get accessibleOutlets;

  /// Create a copy of EmployeeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$EmployeeModelImplCopyWith<_$EmployeeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
