// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'petty_cash_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PettyCashModel _$PettyCashModelFromJson(Map<String, dynamic> json) {
  return _PettyCashModel.fromJson(json);
}

/// @nodoc
mixin _$PettyCashModel {
  int get id => throw _privateConstructorUsedError;
  String? get code => throw _privateConstructorUsedError;
  int? get ownerId => throw _privateConstructorUsedError;
  int? get outletId => throw _privateConstructorUsedError;
  int? get cashierId => throw _privateConstructorUsedError;
  int? get sourceAccountId => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String? get formattedAmount => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get requestDate => throw _privateConstructorUsedError;
  String? get requestDateFormatted => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  String? get statusColor => throw _privateConstructorUsedError;
  int? get approvedBy => throw _privateConstructorUsedError;
  String? get approvedAt => throw _privateConstructorUsedError;
  String? get approvedAtFormatted => throw _privateConstructorUsedError;
  String? get rejectionReason => throw _privateConstructorUsedError;
  int? get journalEntryId => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get createdAtFormatted => throw _privateConstructorUsedError;
  String? get createdAtHuman =>
      throw _privateConstructorUsedError; // Relational data
  Map<String, dynamic>? get cashier => throw _privateConstructorUsedError;
  Map<String, dynamic>? get outlet => throw _privateConstructorUsedError;
  Map<String, dynamic>? get sourceAccount => throw _privateConstructorUsedError;
  Map<String, dynamic>? get approvedByUser =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get journalEntry => throw _privateConstructorUsedError;

  /// Serializes this PettyCashModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PettyCashModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PettyCashModelCopyWith<PettyCashModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PettyCashModelCopyWith<$Res> {
  factory $PettyCashModelCopyWith(
    PettyCashModel value,
    $Res Function(PettyCashModel) then,
  ) = _$PettyCashModelCopyWithImpl<$Res, PettyCashModel>;
  @useResult
  $Res call({
    int id,
    String? code,
    int? ownerId,
    int? outletId,
    int? cashierId,
    int? sourceAccountId,
    double amount,
    String? formattedAmount,
    String? description,
    String? requestDate,
    String? requestDateFormatted,
    String status,
    String? statusLabel,
    String? statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class _$PettyCashModelCopyWithImpl<$Res, $Val extends PettyCashModel>
    implements $PettyCashModelCopyWith<$Res> {
  _$PettyCashModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PettyCashModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = freezed,
    Object? ownerId = freezed,
    Object? outletId = freezed,
    Object? cashierId = freezed,
    Object? sourceAccountId = freezed,
    Object? amount = null,
    Object? formattedAmount = freezed,
    Object? description = freezed,
    Object? requestDate = freezed,
    Object? requestDateFormatted = freezed,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? statusColor = freezed,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? approvedAtFormatted = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? createdAtFormatted = freezed,
    Object? createdAtHuman = freezed,
    Object? cashier = freezed,
    Object? outlet = freezed,
    Object? sourceAccount = freezed,
    Object? approvedByUser = freezed,
    Object? journalEntry = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            code: freezed == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String?,
            ownerId: freezed == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as int?,
            outletId: freezed == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int?,
            cashierId: freezed == cashierId
                ? _value.cashierId
                : cashierId // ignore: cast_nullable_to_non_nullable
                      as int?,
            sourceAccountId: freezed == sourceAccountId
                ? _value.sourceAccountId
                : sourceAccountId // ignore: cast_nullable_to_non_nullable
                      as int?,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedAmount: freezed == formattedAmount
                ? _value.formattedAmount
                : formattedAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            requestDate: freezed == requestDate
                ? _value.requestDate
                : requestDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            requestDateFormatted: freezed == requestDateFormatted
                ? _value.requestDateFormatted
                : requestDateFormatted // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusColor: freezed == statusColor
                ? _value.statusColor
                : statusColor // ignore: cast_nullable_to_non_nullable
                      as String?,
            approvedBy: freezed == approvedBy
                ? _value.approvedBy
                : approvedBy // ignore: cast_nullable_to_non_nullable
                      as int?,
            approvedAt: freezed == approvedAt
                ? _value.approvedAt
                : approvedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            approvedAtFormatted: freezed == approvedAtFormatted
                ? _value.approvedAtFormatted
                : approvedAtFormatted // ignore: cast_nullable_to_non_nullable
                      as String?,
            rejectionReason: freezed == rejectionReason
                ? _value.rejectionReason
                : rejectionReason // ignore: cast_nullable_to_non_nullable
                      as String?,
            journalEntryId: freezed == journalEntryId
                ? _value.journalEntryId
                : journalEntryId // ignore: cast_nullable_to_non_nullable
                      as int?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAtFormatted: freezed == createdAtFormatted
                ? _value.createdAtFormatted
                : createdAtFormatted // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAtHuman: freezed == createdAtHuman
                ? _value.createdAtHuman
                : createdAtHuman // ignore: cast_nullable_to_non_nullable
                      as String?,
            cashier: freezed == cashier
                ? _value.cashier
                : cashier // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            outlet: freezed == outlet
                ? _value.outlet
                : outlet // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            sourceAccount: freezed == sourceAccount
                ? _value.sourceAccount
                : sourceAccount // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            approvedByUser: freezed == approvedByUser
                ? _value.approvedByUser
                : approvedByUser // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            journalEntry: freezed == journalEntry
                ? _value.journalEntry
                : journalEntry // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PettyCashModelImplCopyWith<$Res>
    implements $PettyCashModelCopyWith<$Res> {
  factory _$$PettyCashModelImplCopyWith(
    _$PettyCashModelImpl value,
    $Res Function(_$PettyCashModelImpl) then,
  ) = __$$PettyCashModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String? code,
    int? ownerId,
    int? outletId,
    int? cashierId,
    int? sourceAccountId,
    double amount,
    String? formattedAmount,
    String? description,
    String? requestDate,
    String? requestDateFormatted,
    String status,
    String? statusLabel,
    String? statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class __$$PettyCashModelImplCopyWithImpl<$Res>
    extends _$PettyCashModelCopyWithImpl<$Res, _$PettyCashModelImpl>
    implements _$$PettyCashModelImplCopyWith<$Res> {
  __$$PettyCashModelImplCopyWithImpl(
    _$PettyCashModelImpl _value,
    $Res Function(_$PettyCashModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PettyCashModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = freezed,
    Object? ownerId = freezed,
    Object? outletId = freezed,
    Object? cashierId = freezed,
    Object? sourceAccountId = freezed,
    Object? amount = null,
    Object? formattedAmount = freezed,
    Object? description = freezed,
    Object? requestDate = freezed,
    Object? requestDateFormatted = freezed,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? statusColor = freezed,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? approvedAtFormatted = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? createdAtFormatted = freezed,
    Object? createdAtHuman = freezed,
    Object? cashier = freezed,
    Object? outlet = freezed,
    Object? sourceAccount = freezed,
    Object? approvedByUser = freezed,
    Object? journalEntry = freezed,
  }) {
    return _then(
      _$PettyCashModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        code: freezed == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String?,
        ownerId: freezed == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as int?,
        outletId: freezed == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int?,
        cashierId: freezed == cashierId
            ? _value.cashierId
            : cashierId // ignore: cast_nullable_to_non_nullable
                  as int?,
        sourceAccountId: freezed == sourceAccountId
            ? _value.sourceAccountId
            : sourceAccountId // ignore: cast_nullable_to_non_nullable
                  as int?,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedAmount: freezed == formattedAmount
            ? _value.formattedAmount
            : formattedAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        requestDate: freezed == requestDate
            ? _value.requestDate
            : requestDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        requestDateFormatted: freezed == requestDateFormatted
            ? _value.requestDateFormatted
            : requestDateFormatted // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusColor: freezed == statusColor
            ? _value.statusColor
            : statusColor // ignore: cast_nullable_to_non_nullable
                  as String?,
        approvedBy: freezed == approvedBy
            ? _value.approvedBy
            : approvedBy // ignore: cast_nullable_to_non_nullable
                  as int?,
        approvedAt: freezed == approvedAt
            ? _value.approvedAt
            : approvedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        approvedAtFormatted: freezed == approvedAtFormatted
            ? _value.approvedAtFormatted
            : approvedAtFormatted // ignore: cast_nullable_to_non_nullable
                  as String?,
        rejectionReason: freezed == rejectionReason
            ? _value.rejectionReason
            : rejectionReason // ignore: cast_nullable_to_non_nullable
                  as String?,
        journalEntryId: freezed == journalEntryId
            ? _value.journalEntryId
            : journalEntryId // ignore: cast_nullable_to_non_nullable
                  as int?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAtFormatted: freezed == createdAtFormatted
            ? _value.createdAtFormatted
            : createdAtFormatted // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAtHuman: freezed == createdAtHuman
            ? _value.createdAtHuman
            : createdAtHuman // ignore: cast_nullable_to_non_nullable
                  as String?,
        cashier: freezed == cashier
            ? _value._cashier
            : cashier // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        outlet: freezed == outlet
            ? _value._outlet
            : outlet // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        sourceAccount: freezed == sourceAccount
            ? _value._sourceAccount
            : sourceAccount // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        approvedByUser: freezed == approvedByUser
            ? _value._approvedByUser
            : approvedByUser // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        journalEntry: freezed == journalEntry
            ? _value._journalEntry
            : journalEntry // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PettyCashModelImpl extends _PettyCashModel {
  const _$PettyCashModelImpl({
    required this.id,
    this.code,
    this.ownerId,
    this.outletId,
    this.cashierId,
    this.sourceAccountId,
    required this.amount,
    this.formattedAmount,
    this.description,
    this.requestDate,
    this.requestDateFormatted,
    required this.status,
    this.statusLabel,
    this.statusColor,
    this.approvedBy,
    this.approvedAt,
    this.approvedAtFormatted,
    this.rejectionReason,
    this.journalEntryId,
    this.createdAt,
    this.updatedAt,
    this.createdAtFormatted,
    this.createdAtHuman,
    final Map<String, dynamic>? cashier,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? approvedByUser,
    final Map<String, dynamic>? journalEntry,
  }) : _cashier = cashier,
       _outlet = outlet,
       _sourceAccount = sourceAccount,
       _approvedByUser = approvedByUser,
       _journalEntry = journalEntry,
       super._();

  factory _$PettyCashModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PettyCashModelImplFromJson(json);

  @override
  final int id;
  @override
  final String? code;
  @override
  final int? ownerId;
  @override
  final int? outletId;
  @override
  final int? cashierId;
  @override
  final int? sourceAccountId;
  @override
  final double amount;
  @override
  final String? formattedAmount;
  @override
  final String? description;
  @override
  final String? requestDate;
  @override
  final String? requestDateFormatted;
  @override
  final String status;
  @override
  final String? statusLabel;
  @override
  final String? statusColor;
  @override
  final int? approvedBy;
  @override
  final String? approvedAt;
  @override
  final String? approvedAtFormatted;
  @override
  final String? rejectionReason;
  @override
  final int? journalEntryId;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? createdAtFormatted;
  @override
  final String? createdAtHuman;
  // Relational data
  final Map<String, dynamic>? _cashier;
  // Relational data
  @override
  Map<String, dynamic>? get cashier {
    final value = _cashier;
    if (value == null) return null;
    if (_cashier is EqualUnmodifiableMapView) return _cashier;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _outlet;
  @override
  Map<String, dynamic>? get outlet {
    final value = _outlet;
    if (value == null) return null;
    if (_outlet is EqualUnmodifiableMapView) return _outlet;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _sourceAccount;
  @override
  Map<String, dynamic>? get sourceAccount {
    final value = _sourceAccount;
    if (value == null) return null;
    if (_sourceAccount is EqualUnmodifiableMapView) return _sourceAccount;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _approvedByUser;
  @override
  Map<String, dynamic>? get approvedByUser {
    final value = _approvedByUser;
    if (value == null) return null;
    if (_approvedByUser is EqualUnmodifiableMapView) return _approvedByUser;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _journalEntry;
  @override
  Map<String, dynamic>? get journalEntry {
    final value = _journalEntry;
    if (value == null) return null;
    if (_journalEntry is EqualUnmodifiableMapView) return _journalEntry;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'PettyCashModel(id: $id, code: $code, ownerId: $ownerId, outletId: $outletId, cashierId: $cashierId, sourceAccountId: $sourceAccountId, amount: $amount, formattedAmount: $formattedAmount, description: $description, requestDate: $requestDate, requestDateFormatted: $requestDateFormatted, status: $status, statusLabel: $statusLabel, statusColor: $statusColor, approvedBy: $approvedBy, approvedAt: $approvedAt, approvedAtFormatted: $approvedAtFormatted, rejectionReason: $rejectionReason, journalEntryId: $journalEntryId, createdAt: $createdAt, updatedAt: $updatedAt, createdAtFormatted: $createdAtFormatted, createdAtHuman: $createdAtHuman, cashier: $cashier, outlet: $outlet, sourceAccount: $sourceAccount, approvedByUser: $approvedByUser, journalEntry: $journalEntry)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PettyCashModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.cashierId, cashierId) ||
                other.cashierId == cashierId) &&
            (identical(other.sourceAccountId, sourceAccountId) ||
                other.sourceAccountId == sourceAccountId) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.formattedAmount, formattedAmount) ||
                other.formattedAmount == formattedAmount) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.requestDate, requestDate) ||
                other.requestDate == requestDate) &&
            (identical(other.requestDateFormatted, requestDateFormatted) ||
                other.requestDateFormatted == requestDateFormatted) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.statusColor, statusColor) ||
                other.statusColor == statusColor) &&
            (identical(other.approvedBy, approvedBy) ||
                other.approvedBy == approvedBy) &&
            (identical(other.approvedAt, approvedAt) ||
                other.approvedAt == approvedAt) &&
            (identical(other.approvedAtFormatted, approvedAtFormatted) ||
                other.approvedAtFormatted == approvedAtFormatted) &&
            (identical(other.rejectionReason, rejectionReason) ||
                other.rejectionReason == rejectionReason) &&
            (identical(other.journalEntryId, journalEntryId) ||
                other.journalEntryId == journalEntryId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.createdAtFormatted, createdAtFormatted) ||
                other.createdAtFormatted == createdAtFormatted) &&
            (identical(other.createdAtHuman, createdAtHuman) ||
                other.createdAtHuman == createdAtHuman) &&
            const DeepCollectionEquality().equals(other._cashier, _cashier) &&
            const DeepCollectionEquality().equals(other._outlet, _outlet) &&
            const DeepCollectionEquality().equals(
              other._sourceAccount,
              _sourceAccount,
            ) &&
            const DeepCollectionEquality().equals(
              other._approvedByUser,
              _approvedByUser,
            ) &&
            const DeepCollectionEquality().equals(
              other._journalEntry,
              _journalEntry,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    code,
    ownerId,
    outletId,
    cashierId,
    sourceAccountId,
    amount,
    formattedAmount,
    description,
    requestDate,
    requestDateFormatted,
    status,
    statusLabel,
    statusColor,
    approvedBy,
    approvedAt,
    approvedAtFormatted,
    rejectionReason,
    journalEntryId,
    createdAt,
    updatedAt,
    createdAtFormatted,
    createdAtHuman,
    const DeepCollectionEquality().hash(_cashier),
    const DeepCollectionEquality().hash(_outlet),
    const DeepCollectionEquality().hash(_sourceAccount),
    const DeepCollectionEquality().hash(_approvedByUser),
    const DeepCollectionEquality().hash(_journalEntry),
  ]);

  /// Create a copy of PettyCashModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PettyCashModelImplCopyWith<_$PettyCashModelImpl> get copyWith =>
      __$$PettyCashModelImplCopyWithImpl<_$PettyCashModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PettyCashModelImplToJson(this);
  }
}

abstract class _PettyCashModel extends PettyCashModel {
  const factory _PettyCashModel({
    required final int id,
    final String? code,
    final int? ownerId,
    final int? outletId,
    final int? cashierId,
    final int? sourceAccountId,
    required final double amount,
    final String? formattedAmount,
    final String? description,
    final String? requestDate,
    final String? requestDateFormatted,
    required final String status,
    final String? statusLabel,
    final String? statusColor,
    final int? approvedBy,
    final String? approvedAt,
    final String? approvedAtFormatted,
    final String? rejectionReason,
    final int? journalEntryId,
    final String? createdAt,
    final String? updatedAt,
    final String? createdAtFormatted,
    final String? createdAtHuman,
    final Map<String, dynamic>? cashier,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? approvedByUser,
    final Map<String, dynamic>? journalEntry,
  }) = _$PettyCashModelImpl;
  const _PettyCashModel._() : super._();

  factory _PettyCashModel.fromJson(Map<String, dynamic> json) =
      _$PettyCashModelImpl.fromJson;

  @override
  int get id;
  @override
  String? get code;
  @override
  int? get ownerId;
  @override
  int? get outletId;
  @override
  int? get cashierId;
  @override
  int? get sourceAccountId;
  @override
  double get amount;
  @override
  String? get formattedAmount;
  @override
  String? get description;
  @override
  String? get requestDate;
  @override
  String? get requestDateFormatted;
  @override
  String get status;
  @override
  String? get statusLabel;
  @override
  String? get statusColor;
  @override
  int? get approvedBy;
  @override
  String? get approvedAt;
  @override
  String? get approvedAtFormatted;
  @override
  String? get rejectionReason;
  @override
  int? get journalEntryId;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get createdAtFormatted;
  @override
  String? get createdAtHuman; // Relational data
  @override
  Map<String, dynamic>? get cashier;
  @override
  Map<String, dynamic>? get outlet;
  @override
  Map<String, dynamic>? get sourceAccount;
  @override
  Map<String, dynamic>? get approvedByUser;
  @override
  Map<String, dynamic>? get journalEntry;

  /// Create a copy of PettyCashModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PettyCashModelImplCopyWith<_$PettyCashModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
