// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'expense_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ExpenseModel _$ExpenseModelFromJson(Map<String, dynamic> json) {
  return _ExpenseModel.fromJson(json);
}

/// @nodoc
mixin _$ExpenseModel {
  int get id => throw _privateConstructorUsedError;
  String get code => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  int? get userId => throw _privateConstructorUsedError;
  int? get employeeId => throw _privateConstructorUsedError;
  int get expenseAccountId => throw _privateConstructorUsedError;
  int get sourceAccountId => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  String? get date => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get attachment => throw _privateConstructorUsedError;
  String? get attachmentUrl => throw _privateConstructorUsedError;
  bool get hasAttachment => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  int? get approvedBy => throw _privateConstructorUsedError;
  String? get approvedAt => throw _privateConstructorUsedError;
  String? get rejectionReason => throw _privateConstructorUsedError;
  int? get journalEntryId => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get deletedAt => throw _privateConstructorUsedError;
  String? get formattedAmount => throw _privateConstructorUsedError;
  String? get formattedDate => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  String? get statusColor => throw _privateConstructorUsedError;
  bool get isPending => throw _privateConstructorUsedError;
  bool get isApproved => throw _privateConstructorUsedError;
  bool get isRejected => throw _privateConstructorUsedError;
  bool get canBeApproved => throw _privateConstructorUsedError;
  bool get canBeRejected => throw _privateConstructorUsedError;
  bool get canBeCancelled => throw _privateConstructorUsedError;
  Map<String, dynamic>? get outlet => throw _privateConstructorUsedError;
  Map<String, dynamic>? get employee => throw _privateConstructorUsedError;
  Map<String, dynamic>? get user => throw _privateConstructorUsedError;
  Map<String, dynamic>? get expenseAccount =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get sourceAccount => throw _privateConstructorUsedError;
  Map<String, dynamic>? get approver => throw _privateConstructorUsedError;
  Map<String, dynamic>? get journalEntry => throw _privateConstructorUsedError;

  /// Serializes this ExpenseModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ExpenseModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ExpenseModelCopyWith<ExpenseModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ExpenseModelCopyWith<$Res> {
  factory $ExpenseModelCopyWith(
    ExpenseModel value,
    $Res Function(ExpenseModel) then,
  ) = _$ExpenseModelCopyWithImpl<$Res, ExpenseModel>;
  @useResult
  $Res call({
    int id,
    String code,
    int outletId,
    int? userId,
    int? employeeId,
    int expenseAccountId,
    int sourceAccountId,
    double amount,
    String? date,
    String? description,
    String? attachment,
    String? attachmentUrl,
    bool hasAttachment,
    String status,
    int? approvedBy,
    String? approvedAt,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    String? formattedAmount,
    String? formattedDate,
    String? statusLabel,
    String? statusColor,
    bool isPending,
    bool isApproved,
    bool isRejected,
    bool canBeApproved,
    bool canBeRejected,
    bool canBeCancelled,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? employee,
    Map<String, dynamic>? user,
    Map<String, dynamic>? expenseAccount,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approver,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class _$ExpenseModelCopyWithImpl<$Res, $Val extends ExpenseModel>
    implements $ExpenseModelCopyWith<$Res> {
  _$ExpenseModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ExpenseModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? outletId = null,
    Object? userId = freezed,
    Object? employeeId = freezed,
    Object? expenseAccountId = null,
    Object? sourceAccountId = null,
    Object? amount = null,
    Object? date = freezed,
    Object? description = freezed,
    Object? attachment = freezed,
    Object? attachmentUrl = freezed,
    Object? hasAttachment = null,
    Object? status = null,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? formattedAmount = freezed,
    Object? formattedDate = freezed,
    Object? statusLabel = freezed,
    Object? statusColor = freezed,
    Object? isPending = null,
    Object? isApproved = null,
    Object? isRejected = null,
    Object? canBeApproved = null,
    Object? canBeRejected = null,
    Object? canBeCancelled = null,
    Object? outlet = freezed,
    Object? employee = freezed,
    Object? user = freezed,
    Object? expenseAccount = freezed,
    Object? sourceAccount = freezed,
    Object? approver = freezed,
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
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            userId: freezed == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as int?,
            employeeId: freezed == employeeId
                ? _value.employeeId
                : employeeId // ignore: cast_nullable_to_non_nullable
                      as int?,
            expenseAccountId: null == expenseAccountId
                ? _value.expenseAccountId
                : expenseAccountId // ignore: cast_nullable_to_non_nullable
                      as int,
            sourceAccountId: null == sourceAccountId
                ? _value.sourceAccountId
                : sourceAccountId // ignore: cast_nullable_to_non_nullable
                      as int,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            date: freezed == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            attachment: freezed == attachment
                ? _value.attachment
                : attachment // ignore: cast_nullable_to_non_nullable
                      as String?,
            attachmentUrl: freezed == attachmentUrl
                ? _value.attachmentUrl
                : attachmentUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            hasAttachment: null == hasAttachment
                ? _value.hasAttachment
                : hasAttachment // ignore: cast_nullable_to_non_nullable
                      as bool,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            approvedBy: freezed == approvedBy
                ? _value.approvedBy
                : approvedBy // ignore: cast_nullable_to_non_nullable
                      as int?,
            approvedAt: freezed == approvedAt
                ? _value.approvedAt
                : approvedAt // ignore: cast_nullable_to_non_nullable
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
            deletedAt: freezed == deletedAt
                ? _value.deletedAt
                : deletedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedAmount: freezed == formattedAmount
                ? _value.formattedAmount
                : formattedAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedDate: freezed == formattedDate
                ? _value.formattedDate
                : formattedDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusColor: freezed == statusColor
                ? _value.statusColor
                : statusColor // ignore: cast_nullable_to_non_nullable
                      as String?,
            isPending: null == isPending
                ? _value.isPending
                : isPending // ignore: cast_nullable_to_non_nullable
                      as bool,
            isApproved: null == isApproved
                ? _value.isApproved
                : isApproved // ignore: cast_nullable_to_non_nullable
                      as bool,
            isRejected: null == isRejected
                ? _value.isRejected
                : isRejected // ignore: cast_nullable_to_non_nullable
                      as bool,
            canBeApproved: null == canBeApproved
                ? _value.canBeApproved
                : canBeApproved // ignore: cast_nullable_to_non_nullable
                      as bool,
            canBeRejected: null == canBeRejected
                ? _value.canBeRejected
                : canBeRejected // ignore: cast_nullable_to_non_nullable
                      as bool,
            canBeCancelled: null == canBeCancelled
                ? _value.canBeCancelled
                : canBeCancelled // ignore: cast_nullable_to_non_nullable
                      as bool,
            outlet: freezed == outlet
                ? _value.outlet
                : outlet // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            employee: freezed == employee
                ? _value.employee
                : employee // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            user: freezed == user
                ? _value.user
                : user // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            expenseAccount: freezed == expenseAccount
                ? _value.expenseAccount
                : expenseAccount // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            sourceAccount: freezed == sourceAccount
                ? _value.sourceAccount
                : sourceAccount // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            approver: freezed == approver
                ? _value.approver
                : approver // ignore: cast_nullable_to_non_nullable
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
abstract class _$$ExpenseModelImplCopyWith<$Res>
    implements $ExpenseModelCopyWith<$Res> {
  factory _$$ExpenseModelImplCopyWith(
    _$ExpenseModelImpl value,
    $Res Function(_$ExpenseModelImpl) then,
  ) = __$$ExpenseModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String code,
    int outletId,
    int? userId,
    int? employeeId,
    int expenseAccountId,
    int sourceAccountId,
    double amount,
    String? date,
    String? description,
    String? attachment,
    String? attachmentUrl,
    bool hasAttachment,
    String status,
    int? approvedBy,
    String? approvedAt,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    String? formattedAmount,
    String? formattedDate,
    String? statusLabel,
    String? statusColor,
    bool isPending,
    bool isApproved,
    bool isRejected,
    bool canBeApproved,
    bool canBeRejected,
    bool canBeCancelled,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? employee,
    Map<String, dynamic>? user,
    Map<String, dynamic>? expenseAccount,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approver,
    Map<String, dynamic>? journalEntry,
  });
}

/// @nodoc
class __$$ExpenseModelImplCopyWithImpl<$Res>
    extends _$ExpenseModelCopyWithImpl<$Res, _$ExpenseModelImpl>
    implements _$$ExpenseModelImplCopyWith<$Res> {
  __$$ExpenseModelImplCopyWithImpl(
    _$ExpenseModelImpl _value,
    $Res Function(_$ExpenseModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ExpenseModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? code = null,
    Object? outletId = null,
    Object? userId = freezed,
    Object? employeeId = freezed,
    Object? expenseAccountId = null,
    Object? sourceAccountId = null,
    Object? amount = null,
    Object? date = freezed,
    Object? description = freezed,
    Object? attachment = freezed,
    Object? attachmentUrl = freezed,
    Object? hasAttachment = null,
    Object? status = null,
    Object? approvedBy = freezed,
    Object? approvedAt = freezed,
    Object? rejectionReason = freezed,
    Object? journalEntryId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? formattedAmount = freezed,
    Object? formattedDate = freezed,
    Object? statusLabel = freezed,
    Object? statusColor = freezed,
    Object? isPending = null,
    Object? isApproved = null,
    Object? isRejected = null,
    Object? canBeApproved = null,
    Object? canBeRejected = null,
    Object? canBeCancelled = null,
    Object? outlet = freezed,
    Object? employee = freezed,
    Object? user = freezed,
    Object? expenseAccount = freezed,
    Object? sourceAccount = freezed,
    Object? approver = freezed,
    Object? journalEntry = freezed,
  }) {
    return _then(
      _$ExpenseModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        code: null == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        userId: freezed == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as int?,
        employeeId: freezed == employeeId
            ? _value.employeeId
            : employeeId // ignore: cast_nullable_to_non_nullable
                  as int?,
        expenseAccountId: null == expenseAccountId
            ? _value.expenseAccountId
            : expenseAccountId // ignore: cast_nullable_to_non_nullable
                  as int,
        sourceAccountId: null == sourceAccountId
            ? _value.sourceAccountId
            : sourceAccountId // ignore: cast_nullable_to_non_nullable
                  as int,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        date: freezed == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        attachment: freezed == attachment
            ? _value.attachment
            : attachment // ignore: cast_nullable_to_non_nullable
                  as String?,
        attachmentUrl: freezed == attachmentUrl
            ? _value.attachmentUrl
            : attachmentUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        hasAttachment: null == hasAttachment
            ? _value.hasAttachment
            : hasAttachment // ignore: cast_nullable_to_non_nullable
                  as bool,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        approvedBy: freezed == approvedBy
            ? _value.approvedBy
            : approvedBy // ignore: cast_nullable_to_non_nullable
                  as int?,
        approvedAt: freezed == approvedAt
            ? _value.approvedAt
            : approvedAt // ignore: cast_nullable_to_non_nullable
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
        deletedAt: freezed == deletedAt
            ? _value.deletedAt
            : deletedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedAmount: freezed == formattedAmount
            ? _value.formattedAmount
            : formattedAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedDate: freezed == formattedDate
            ? _value.formattedDate
            : formattedDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusColor: freezed == statusColor
            ? _value.statusColor
            : statusColor // ignore: cast_nullable_to_non_nullable
                  as String?,
        isPending: null == isPending
            ? _value.isPending
            : isPending // ignore: cast_nullable_to_non_nullable
                  as bool,
        isApproved: null == isApproved
            ? _value.isApproved
            : isApproved // ignore: cast_nullable_to_non_nullable
                  as bool,
        isRejected: null == isRejected
            ? _value.isRejected
            : isRejected // ignore: cast_nullable_to_non_nullable
                  as bool,
        canBeApproved: null == canBeApproved
            ? _value.canBeApproved
            : canBeApproved // ignore: cast_nullable_to_non_nullable
                  as bool,
        canBeRejected: null == canBeRejected
            ? _value.canBeRejected
            : canBeRejected // ignore: cast_nullable_to_non_nullable
                  as bool,
        canBeCancelled: null == canBeCancelled
            ? _value.canBeCancelled
            : canBeCancelled // ignore: cast_nullable_to_non_nullable
                  as bool,
        outlet: freezed == outlet
            ? _value._outlet
            : outlet // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        employee: freezed == employee
            ? _value._employee
            : employee // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        user: freezed == user
            ? _value._user
            : user // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        expenseAccount: freezed == expenseAccount
            ? _value._expenseAccount
            : expenseAccount // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        sourceAccount: freezed == sourceAccount
            ? _value._sourceAccount
            : sourceAccount // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        approver: freezed == approver
            ? _value._approver
            : approver // ignore: cast_nullable_to_non_nullable
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
class _$ExpenseModelImpl extends _ExpenseModel {
  const _$ExpenseModelImpl({
    required this.id,
    required this.code,
    required this.outletId,
    this.userId,
    this.employeeId,
    required this.expenseAccountId,
    required this.sourceAccountId,
    required this.amount,
    this.date,
    this.description,
    this.attachment,
    this.attachmentUrl,
    this.hasAttachment = false,
    required this.status,
    this.approvedBy,
    this.approvedAt,
    this.rejectionReason,
    this.journalEntryId,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.formattedAmount,
    this.formattedDate,
    this.statusLabel,
    this.statusColor,
    this.isPending = false,
    this.isApproved = false,
    this.isRejected = false,
    this.canBeApproved = false,
    this.canBeRejected = false,
    this.canBeCancelled = false,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? employee,
    final Map<String, dynamic>? user,
    final Map<String, dynamic>? expenseAccount,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? approver,
    final Map<String, dynamic>? journalEntry,
  }) : _outlet = outlet,
       _employee = employee,
       _user = user,
       _expenseAccount = expenseAccount,
       _sourceAccount = sourceAccount,
       _approver = approver,
       _journalEntry = journalEntry,
       super._();

  factory _$ExpenseModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ExpenseModelImplFromJson(json);

  @override
  final int id;
  @override
  final String code;
  @override
  final int outletId;
  @override
  final int? userId;
  @override
  final int? employeeId;
  @override
  final int expenseAccountId;
  @override
  final int sourceAccountId;
  @override
  final double amount;
  @override
  final String? date;
  @override
  final String? description;
  @override
  final String? attachment;
  @override
  final String? attachmentUrl;
  @override
  @JsonKey()
  final bool hasAttachment;
  @override
  final String status;
  @override
  final int? approvedBy;
  @override
  final String? approvedAt;
  @override
  final String? rejectionReason;
  @override
  final int? journalEntryId;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? deletedAt;
  @override
  final String? formattedAmount;
  @override
  final String? formattedDate;
  @override
  final String? statusLabel;
  @override
  final String? statusColor;
  @override
  @JsonKey()
  final bool isPending;
  @override
  @JsonKey()
  final bool isApproved;
  @override
  @JsonKey()
  final bool isRejected;
  @override
  @JsonKey()
  final bool canBeApproved;
  @override
  @JsonKey()
  final bool canBeRejected;
  @override
  @JsonKey()
  final bool canBeCancelled;
  final Map<String, dynamic>? _outlet;
  @override
  Map<String, dynamic>? get outlet {
    final value = _outlet;
    if (value == null) return null;
    if (_outlet is EqualUnmodifiableMapView) return _outlet;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _employee;
  @override
  Map<String, dynamic>? get employee {
    final value = _employee;
    if (value == null) return null;
    if (_employee is EqualUnmodifiableMapView) return _employee;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _user;
  @override
  Map<String, dynamic>? get user {
    final value = _user;
    if (value == null) return null;
    if (_user is EqualUnmodifiableMapView) return _user;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _expenseAccount;
  @override
  Map<String, dynamic>? get expenseAccount {
    final value = _expenseAccount;
    if (value == null) return null;
    if (_expenseAccount is EqualUnmodifiableMapView) return _expenseAccount;
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

  final Map<String, dynamic>? _approver;
  @override
  Map<String, dynamic>? get approver {
    final value = _approver;
    if (value == null) return null;
    if (_approver is EqualUnmodifiableMapView) return _approver;
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
    return 'ExpenseModel(id: $id, code: $code, outletId: $outletId, userId: $userId, employeeId: $employeeId, expenseAccountId: $expenseAccountId, sourceAccountId: $sourceAccountId, amount: $amount, date: $date, description: $description, attachment: $attachment, attachmentUrl: $attachmentUrl, hasAttachment: $hasAttachment, status: $status, approvedBy: $approvedBy, approvedAt: $approvedAt, rejectionReason: $rejectionReason, journalEntryId: $journalEntryId, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, formattedAmount: $formattedAmount, formattedDate: $formattedDate, statusLabel: $statusLabel, statusColor: $statusColor, isPending: $isPending, isApproved: $isApproved, isRejected: $isRejected, canBeApproved: $canBeApproved, canBeRejected: $canBeRejected, canBeCancelled: $canBeCancelled, outlet: $outlet, employee: $employee, user: $user, expenseAccount: $expenseAccount, sourceAccount: $sourceAccount, approver: $approver, journalEntry: $journalEntry)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ExpenseModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.employeeId, employeeId) ||
                other.employeeId == employeeId) &&
            (identical(other.expenseAccountId, expenseAccountId) ||
                other.expenseAccountId == expenseAccountId) &&
            (identical(other.sourceAccountId, sourceAccountId) ||
                other.sourceAccountId == sourceAccountId) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.date, date) || other.date == date) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.attachment, attachment) ||
                other.attachment == attachment) &&
            (identical(other.attachmentUrl, attachmentUrl) ||
                other.attachmentUrl == attachmentUrl) &&
            (identical(other.hasAttachment, hasAttachment) ||
                other.hasAttachment == hasAttachment) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.approvedBy, approvedBy) ||
                other.approvedBy == approvedBy) &&
            (identical(other.approvedAt, approvedAt) ||
                other.approvedAt == approvedAt) &&
            (identical(other.rejectionReason, rejectionReason) ||
                other.rejectionReason == rejectionReason) &&
            (identical(other.journalEntryId, journalEntryId) ||
                other.journalEntryId == journalEntryId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt) &&
            (identical(other.formattedAmount, formattedAmount) ||
                other.formattedAmount == formattedAmount) &&
            (identical(other.formattedDate, formattedDate) ||
                other.formattedDate == formattedDate) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.statusColor, statusColor) ||
                other.statusColor == statusColor) &&
            (identical(other.isPending, isPending) ||
                other.isPending == isPending) &&
            (identical(other.isApproved, isApproved) ||
                other.isApproved == isApproved) &&
            (identical(other.isRejected, isRejected) ||
                other.isRejected == isRejected) &&
            (identical(other.canBeApproved, canBeApproved) ||
                other.canBeApproved == canBeApproved) &&
            (identical(other.canBeRejected, canBeRejected) ||
                other.canBeRejected == canBeRejected) &&
            (identical(other.canBeCancelled, canBeCancelled) ||
                other.canBeCancelled == canBeCancelled) &&
            const DeepCollectionEquality().equals(other._outlet, _outlet) &&
            const DeepCollectionEquality().equals(other._employee, _employee) &&
            const DeepCollectionEquality().equals(other._user, _user) &&
            const DeepCollectionEquality().equals(
              other._expenseAccount,
              _expenseAccount,
            ) &&
            const DeepCollectionEquality().equals(
              other._sourceAccount,
              _sourceAccount,
            ) &&
            const DeepCollectionEquality().equals(other._approver, _approver) &&
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
    outletId,
    userId,
    employeeId,
    expenseAccountId,
    sourceAccountId,
    amount,
    date,
    description,
    attachment,
    attachmentUrl,
    hasAttachment,
    status,
    approvedBy,
    approvedAt,
    rejectionReason,
    journalEntryId,
    createdAt,
    updatedAt,
    deletedAt,
    formattedAmount,
    formattedDate,
    statusLabel,
    statusColor,
    isPending,
    isApproved,
    isRejected,
    canBeApproved,
    canBeRejected,
    canBeCancelled,
    const DeepCollectionEquality().hash(_outlet),
    const DeepCollectionEquality().hash(_employee),
    const DeepCollectionEquality().hash(_user),
    const DeepCollectionEquality().hash(_expenseAccount),
    const DeepCollectionEquality().hash(_sourceAccount),
    const DeepCollectionEquality().hash(_approver),
    const DeepCollectionEquality().hash(_journalEntry),
  ]);

  /// Create a copy of ExpenseModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ExpenseModelImplCopyWith<_$ExpenseModelImpl> get copyWith =>
      __$$ExpenseModelImplCopyWithImpl<_$ExpenseModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ExpenseModelImplToJson(this);
  }
}

abstract class _ExpenseModel extends ExpenseModel {
  const factory _ExpenseModel({
    required final int id,
    required final String code,
    required final int outletId,
    final int? userId,
    final int? employeeId,
    required final int expenseAccountId,
    required final int sourceAccountId,
    required final double amount,
    final String? date,
    final String? description,
    final String? attachment,
    final String? attachmentUrl,
    final bool hasAttachment,
    required final String status,
    final int? approvedBy,
    final String? approvedAt,
    final String? rejectionReason,
    final int? journalEntryId,
    final String? createdAt,
    final String? updatedAt,
    final String? deletedAt,
    final String? formattedAmount,
    final String? formattedDate,
    final String? statusLabel,
    final String? statusColor,
    final bool isPending,
    final bool isApproved,
    final bool isRejected,
    final bool canBeApproved,
    final bool canBeRejected,
    final bool canBeCancelled,
    final Map<String, dynamic>? outlet,
    final Map<String, dynamic>? employee,
    final Map<String, dynamic>? user,
    final Map<String, dynamic>? expenseAccount,
    final Map<String, dynamic>? sourceAccount,
    final Map<String, dynamic>? approver,
    final Map<String, dynamic>? journalEntry,
  }) = _$ExpenseModelImpl;
  const _ExpenseModel._() : super._();

  factory _ExpenseModel.fromJson(Map<String, dynamic> json) =
      _$ExpenseModelImpl.fromJson;

  @override
  int get id;
  @override
  String get code;
  @override
  int get outletId;
  @override
  int? get userId;
  @override
  int? get employeeId;
  @override
  int get expenseAccountId;
  @override
  int get sourceAccountId;
  @override
  double get amount;
  @override
  String? get date;
  @override
  String? get description;
  @override
  String? get attachment;
  @override
  String? get attachmentUrl;
  @override
  bool get hasAttachment;
  @override
  String get status;
  @override
  int? get approvedBy;
  @override
  String? get approvedAt;
  @override
  String? get rejectionReason;
  @override
  int? get journalEntryId;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get deletedAt;
  @override
  String? get formattedAmount;
  @override
  String? get formattedDate;
  @override
  String? get statusLabel;
  @override
  String? get statusColor;
  @override
  bool get isPending;
  @override
  bool get isApproved;
  @override
  bool get isRejected;
  @override
  bool get canBeApproved;
  @override
  bool get canBeRejected;
  @override
  bool get canBeCancelled;
  @override
  Map<String, dynamic>? get outlet;
  @override
  Map<String, dynamic>? get employee;
  @override
  Map<String, dynamic>? get user;
  @override
  Map<String, dynamic>? get expenseAccount;
  @override
  Map<String, dynamic>? get sourceAccount;
  @override
  Map<String, dynamic>? get approver;
  @override
  Map<String, dynamic>? get journalEntry;

  /// Create a copy of ExpenseModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ExpenseModelImplCopyWith<_$ExpenseModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
