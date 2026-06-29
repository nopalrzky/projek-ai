// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'deposit_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

DepositModel _$DepositModelFromJson(Map<String, dynamic> json) {
  return _DepositModel.fromJson(json);
}

/// @nodoc
mixin _$DepositModel {
  int get id => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  int get ownerId => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  int? get cashierId => throw _privateConstructorUsedError;
  int? get sourceAccountId => throw _privateConstructorUsedError;
  int? get destinationAccountId => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String? get formattedAmount => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get attachmentPath => throw _privateConstructorUsedError;
  String? get attachmentUrl => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String get statusLabel => throw _privateConstructorUsedError;
  String get statusColor => throw _privateConstructorUsedError;
  int? get approvedBy => throw _privateConstructorUsedError;
  String? get approvedAt => throw _privateConstructorUsedError;
  String? get approvedAtFormatted => throw _privateConstructorUsedError;
  String? get rejectionReason => throw _privateConstructorUsedError;
  int? get journalEntryId => throw _privateConstructorUsedError;
  String get createdAt => throw _privateConstructorUsedError;
  String get updatedAt => throw _privateConstructorUsedError;
  String? get createdAtFormatted => throw _privateConstructorUsedError;
  String? get createdAtHuman => throw _privateConstructorUsedError;
  Map<String, dynamic>? get cashier => throw _privateConstructorUsedError;
  Map<String, dynamic>? get outlet => throw _privateConstructorUsedError;
  Map<String, dynamic>? get sourceAccount => throw _privateConstructorUsedError;
  Map<String, dynamic>? get destinationAccount =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get approvedByUser =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get journalEntry => throw _privateConstructorUsedError;

  /// Serializes this DepositModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DepositModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DepositModelCopyWith<DepositModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DepositModelCopyWith<$Res> {
  factory $DepositModelCopyWith(
    DepositModel value,
    $Res Function(DepositModel) then,
  ) = _$DepositModelCopyWithImpl<$Res, DepositModel>;
  @useResult
  $Res call({
    int id,
    String code,
    int ownerId,
    int outletId,
    int? cashierId,
    int? sourceAccountId,
    int? destinationAccountId,
    double amount,
    String? formattedAmount,
    String? notes,
    String? attachmentPath,
    String? attachmentUrl,
    String status,
    String statusLabel,
    String statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    String createdAt,
    String updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? destinationAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class _$DepositModelCopyWithImpl<$Res, $Val extends DepositModel>
    implements $DepositModelCopyWith<$Res> {
  _$DepositModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DepositModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? ownerId = null,
    Object? outletId = null,
    Object? cashierId = freezed,
    Object? sourceAccountId = freezed,
    Object? destinationAccountId = freezed,
    Object? amount = null,
    Object? formattedAmount = freezed,
    Object? notes = freezed,
    Object? attachmentPath = freezed,
    Object? attachmentUrl = freezed,
    Object? status = null,
    Object? statusLabel = null,
    Object? statusColor = null,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? approvedAtFormatted = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? createdAtFormatted = freezed,
    Object? createdAtHuman = freezed,
    Object? cashier = freezed,
    Object? outlet = freezed,
    Object? sourceAccount = freezed,
    Object? destinationAccount = freezed,
    Object? approvedByUser = freezed,
    Object? journalEntry = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            code: null == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String,
            ownerId: null == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            cashierId: freezed == cashierId
                ? _value.cashierId
                : cashierId // ignore: cast_nullable_to_non_nullable
                      as int?,
            sourceAccountId: freezed == sourceAccountId
                ? _value.sourceAccountId
                : sourceAccountId // ignore: cast_nullable_to_non_nullable
                      as int?,
            destinationAccountId: freezed == destinationAccountId
                ? _value.destinationAccountId
                : destinationAccountId // ignore: cast_nullable_to_non_nullable
                      as int?,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedAmount: freezed == formattedAmount
                ? _value.formattedAmount
                : formattedAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            attachmentPath: freezed == attachmentPath
                ? _value.attachmentPath
                : attachmentPath // ignore: cast_nullable_to_non_nullable
                      as String?,
            attachmentUrl: freezed == attachmentUrl
                ? _value.attachmentUrl
                : attachmentUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            statusLabel: null == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String,
            statusColor: null == statusColor
                ? _value.statusColor
                : statusColor // ignore: cast_nullable_to_non_nullable
                      as String,
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
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String,
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
            destinationAccount: freezed == destinationAccount
                ? _value.destinationAccount
                : destinationAccount // ignore: cast_nullable_to_non_nullable
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
abstract class _$$DepositModelImplCopyWith<$Res>
    implements $DepositModelCopyWith<$Res> {
  factory _$$DepositModelImplCopyWith(
    _$DepositModelImpl value,
    $Res Function(_$DepositModelImpl) then,
  ) = __$$DepositModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String code,
    int ownerId,
    int outletId,
    int? cashierId,
    int? sourceAccountId,
    int? destinationAccountId,
    double amount,
    String? formattedAmount,
    String? notes,
    String? attachmentPath,
    String? attachmentUrl,
    String status,
    String statusLabel,
    String statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    String createdAt,
    String updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? destinationAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class __$$DepositModelImplCopyWithImpl<$Res>
    extends _$DepositModelCopyWithImpl<$Res, _$DepositModelImpl>
    implements _$$DepositModelImplCopyWith<$Res> {
  __$$DepositModelImplCopyWithImpl(
    _$DepositModelImpl _value,
    $Res Function(_$DepositModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of DepositModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? ownerId = null,
    Object? outletId = null,
    Object? cashierId = freezed,
    Object? sourceAccountId = freezed,
    Object? destinationAccountId = freezed,
    Object? amount = null,
    Object? formattedAmount = freezed,
    Object? notes = freezed,
    Object? attachmentPath = freezed,
    Object? attachmentUrl = freezed,
    Object? status = null,
    Object? statusLabel = null,
    Object? statusColor = null,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? approvedAtFormatted = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? createdAtFormatted = freezed,
    Object? createdAtHuman = freezed,
    Object? cashier = freezed,
    Object? outlet = freezed,
    Object? sourceAccount = freezed,
    Object? destinationAccount = freezed,
    Object? approvedByUser = freezed,
    Object? journalEntry = freezed,
  }) {
    return _then(
      _$DepositModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
        ownerId: null == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        cashierId: freezed == cashierId
            ? _value.cashierId
            : cashierId // ignore: cast_nullable_to_non_nullable
                  as int?,
        sourceAccountId: freezed == sourceAccountId
            ? _value.sourceAccountId
            : sourceAccountId // ignore: cast_nullable_to_non_nullable
                  as int?,
        destinationAccountId: freezed == destinationAccountId
            ? _value.destinationAccountId
            : destinationAccountId // ignore: cast_nullable_to_non_nullable
                  as int?,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedAmount: freezed == formattedAmount
            ? _value.formattedAmount
            : formattedAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        attachmentPath: freezed == attachmentPath
            ? _value.attachmentPath
            : attachmentPath // ignore: cast_nullable_to_non_nullable
                  as String?,
        attachmentUrl: freezed == attachmentUrl
            ? _value.attachmentUrl
            : attachmentUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        statusLabel: null == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String,
        statusColor: null == statusColor
            ? _value.statusColor
            : statusColor // ignore: cast_nullable_to_non_nullable
                  as String,
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
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String,
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
        destinationAccount: freezed == destinationAccount
            ? _value._destinationAccount
            : destinationAccount // ignore: cast_nullable_to_non_nullable
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
class _$DepositModelImpl extends _DepositModel {
  const _$DepositModelImpl({
    required this.id,
    required this.code,
    required this.ownerId,
    required this.outletId,
    this.cashierId,
    this.sourceAccountId,
    this.destinationAccountId,
    required this.amount,
    this.formattedAmount,
    this.notes,
    this.attachmentPath,
    this.attachmentUrl,
    required this.status,
    this.statusLabel = '',
    this.statusColor = '',
    this.approvedBy,
    this.approvedAt,
    this.approvedAtFormatted,
    this.rejectionReason,
    this.journalEntryId,
    required this.createdAt,
    required this.updatedAt,
    this.createdAtFormatted,
    this.createdAtHuman,
    final Map<String, dynamic>? cashier,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? destinationAccount,
    final Map<String, dynamic>? approvedByUser,
    final Map<String, dynamic>? journalEntry,
  }) : _cashier = cashier,
       _outlet = outlet,
       _sourceAccount = sourceAccount,
       _destinationAccount = destinationAccount,
       _approvedByUser = approvedByUser,
       _journalEntry = journalEntry,
       super._();

  factory _$DepositModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$DepositModelImplFromJson(json);

  @override
  final int id;
  @override
  final String code;
  @override
  final int ownerId;
  @override
  final int outletId;
  @override
  final int? cashierId;
  @override
  final int? sourceAccountId;
  @override
  final int? destinationAccountId;
  @override
  final double amount;
  @override
  final String? formattedAmount;
  @override
  final String? notes;
  @override
  final String? attachmentPath;
  @override
  final String? attachmentUrl;
  @override
  final String status;
  @override
  @JsonKey()
  final String statusLabel;
  @override
  @JsonKey()
  final String statusColor;
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
  final String createdAt;
  @override
  final String updatedAt;
  @override
  final String? createdAtFormatted;
  @override
  final String? createdAtHuman;
  final Map<String, dynamic>? _cashier;
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

  final Map<String, dynamic>? _destinationAccount;
  @override
  Map<String, dynamic>? get destinationAccount {
    final value = _destinationAccount;
    if (value == null) return null;
    if (_destinationAccount is EqualUnmodifiableMapView)
      return _destinationAccount;
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
    return 'DepositModel(id: $id, code: $code, ownerId: $ownerId, outletId: $outletId, cashierId: $cashierId, sourceAccountId: $sourceAccountId, destinationAccountId: $destinationAccountId, amount: $amount, formattedAmount: $formattedAmount, notes: $notes, attachmentPath: $attachmentPath, attachmentUrl: $attachmentUrl, status: $status, statusLabel: $statusLabel, statusColor: $statusColor, approvedBy: $approvedBy, approvedAt: $approvedAt, approvedAtFormatted: $approvedAtFormatted, rejectionReason: $rejectionReason, journalEntryId: $journalEntryId, createdAt: $createdAt, updatedAt: $updatedAt, createdAtFormatted: $createdAtFormatted, createdAtHuman: $createdAtHuman, cashier: $cashier, outlet: $outlet, sourceAccount: $sourceAccount, destinationAccount: $destinationAccount, approvedByUser: $approvedByUser, journalEntry: $journalEntry)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DepositModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.cashierId, cashierId) ||
                other.cashierId == cashierId) &&
            (identical(other.sourceAccountId, sourceAccountId) ||
                other.sourceAccountId == sourceAccountId) &&
            (identical(other.destinationAccountId, destinationAccountId) ||
                other.destinationAccountId == destinationAccountId) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.formattedAmount, formattedAmount) ||
                other.formattedAmount == formattedAmount) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.attachmentPath, attachmentPath) ||
                other.attachmentPath == attachmentPath) &&
            (identical(other.attachmentUrl, attachmentUrl) ||
                other.attachmentUrl == attachmentUrl) &&
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
              other._destinationAccount,
              _destinationAccount,
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
    destinationAccountId,
    amount,
    formattedAmount,
    notes,
    attachmentPath,
    attachmentUrl,
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
    const DeepCollectionEquality().hash(_destinationAccount),
    const DeepCollectionEquality().hash(_approvedByUser),
    const DeepCollectionEquality().hash(_journalEntry),
  ]);

  /// Create a copy of DepositModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DepositModelImplCopyWith<_$DepositModelImpl> get copyWith =>
      __$$DepositModelImplCopyWithImpl<_$DepositModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DepositModelImplToJson(this);
  }
}

abstract class _DepositModel extends DepositModel {
  const factory _DepositModel({
    required final int id,
    required final String code,
    required final int ownerId,
    required final int outletId,
    final int? cashierId,
    final int? sourceAccountId,
    final int? destinationAccountId,
    required final double amount,
    final String? formattedAmount,
    final String? notes,
    final String? attachmentPath,
    final String? attachmentUrl,
    required final String status,
    final String statusLabel,
    final String statusColor,
    final int? approvedBy,
    final String? approvedAt,
    final String? approvedAtFormatted,
    final String? rejectionReason,
    final int? journalEntryId,
    required final String createdAt,
    required final String updatedAt,
    final String? createdAtFormatted,
    final String? createdAtHuman,
    final Map<String, dynamic>? cashier,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? destinationAccount,
    final Map<String, dynamic>? approvedByUser,
    final Map<String, dynamic>? journalEntry,
  }) = _$DepositModelImpl;
  const _DepositModel._() : super._();

  factory _DepositModel.fromJson(Map<String, dynamic> json) =
      _$DepositModelImpl.fromJson;

  @override
  int get id;
  @override
  String get code;
  @override
  int get ownerId;
  @override
  int get outletId;
  @override
  int? get cashierId;
  @override
  int? get sourceAccountId;
  @override
  int? get destinationAccountId;
  @override
  double get amount;
  @override
  String? get formattedAmount;
  @override
  String? get notes;
  @override
  String? get attachmentPath;
  @override
  String? get attachmentUrl;
  @override
  String get status;
  @override
  String get statusLabel;
  @override
  String get statusColor;
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
  String get createdAt;
  @override
  String get updatedAt;
  @override
  String? get createdAtFormatted;
  @override
  String? get createdAtHuman;
  @override
  Map<String, dynamic>? get cashier;
  @override
  Map<String, dynamic>? get outlet;
  @override
  Map<String, dynamic>? get sourceAccount;
  @override
  Map<String, dynamic>? get destinationAccount;
  @override
  Map<String, dynamic>? get approvedByUser;
  @override
  Map<String, dynamic>? get journalEntry;

  /// Create a copy of DepositModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DepositModelImplCopyWith<_$DepositModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
