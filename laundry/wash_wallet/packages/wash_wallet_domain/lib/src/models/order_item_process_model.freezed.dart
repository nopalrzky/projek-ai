// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_item_process_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OrderItemProcessModel _$OrderItemProcessModelFromJson(
  Map<String, dynamic> json,
) {
  return _OrderItemProcessModel.fromJson(json);
}

/// @nodoc
mixin _$OrderItemProcessModel {
  int get id => throw _privateConstructorUsedError;
  int? get orderItemId => throw _privateConstructorUsedError;
  int? get laundryServiceProcessId => throw _privateConstructorUsedError;
  int? get processId => throw _privateConstructorUsedError;
  String? get processName => throw _privateConstructorUsedError;
  int? get sequenceNumber => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  int? get employeeId => throw _privateConstructorUsedError;
  String? get employeeName => throw _privateConstructorUsedError;
  double? get qtyProcessed => throw _privateConstructorUsedError;
  String? get evidenceAttachment => throw _privateConstructorUsedError;
  String? get evidenceUrl => throw _privateConstructorUsedError;
  bool get hasEvidence => throw _privateConstructorUsedError;
  bool get canStart => throw _privateConstructorUsedError;
  bool get canComplete => throw _privateConstructorUsedError;
  bool get canWork => throw _privateConstructorUsedError;
  String? get actionDeniedReason => throw _privateConstructorUsedError;
  DateTime? get startedAt => throw _privateConstructorUsedError;
  DateTime? get completedAt => throw _privateConstructorUsedError;
  String? get formattedStartedAt => throw _privateConstructorUsedError;
  String? get formattedCompletedAt => throw _privateConstructorUsedError;
  bool get isCompleted => throw _privateConstructorUsedError;
  bool get isInProgress => throw _privateConstructorUsedError;
  bool get isPending => throw _privateConstructorUsedError;
  int? get processingDuration => throw _privateConstructorUsedError;
  double? get completionPercentage => throw _privateConstructorUsedError;
  double? get commissionAmount => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  String? get formattedCreatedAt => throw _privateConstructorUsedError;
  String? get formattedUpdatedAt => throw _privateConstructorUsedError;

  /// Serializes this OrderItemProcessModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderItemProcessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderItemProcessModelCopyWith<OrderItemProcessModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderItemProcessModelCopyWith<$Res> {
  factory $OrderItemProcessModelCopyWith(
    OrderItemProcessModel value,
    $Res Function(OrderItemProcessModel) then,
  ) = _$OrderItemProcessModelCopyWithImpl<$Res, OrderItemProcessModel>;
  @useResult
  $Res call({
    int id,
    int? orderItemId,
    int? laundryServiceProcessId,
    int? processId,
    String? processName,
    int? sequenceNumber,
    String? status,
    String? statusLabel,
    int? employeeId,
    String? employeeName,
    double? qtyProcessed,
    String? evidenceAttachment,
    String? evidenceUrl,
    bool hasEvidence,
    bool canStart,
    bool canComplete,
    bool canWork,
    String? actionDeniedReason,
    DateTime? startedAt,
    DateTime? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,
    bool isCompleted,
    bool isInProgress,
    bool isPending,
    int? processingDuration,
    double? completionPercentage,
    double? commissionAmount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  });
}

/// @nodoc
class _$OrderItemProcessModelCopyWithImpl<
  $Res,
  $Val extends OrderItemProcessModel
>
    implements $OrderItemProcessModelCopyWith<$Res> {
  _$OrderItemProcessModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderItemProcessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderItemId = freezed,
    Object? laundryServiceProcessId = freezed,
    Object? processId = freezed,
    Object? processName = freezed,
    Object? sequenceNumber = freezed,
    Object? status = freezed,
    Object? statusLabel = freezed,
    Object? employeeId = freezed,
    Object? employeeName = freezed,
    Object? qtyProcessed = freezed,
    Object? evidenceAttachment = freezed,
    Object? evidenceUrl = freezed,
    Object? hasEvidence = null,
    Object? canStart = null,
    Object? canComplete = null,
    Object? canWork = null,
    Object? actionDeniedReason = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? formattedStartedAt = freezed,
    Object? formattedCompletedAt = freezed,
    Object? isCompleted = null,
    Object? isInProgress = null,
    Object? isPending = null,
    Object? processingDuration = freezed,
    Object? completionPercentage = freezed,
    Object? commissionAmount = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            orderItemId: freezed == orderItemId
                ? _value.orderItemId
                : orderItemId // ignore: cast_nullable_to_non_nullable
                      as int?,
            laundryServiceProcessId: freezed == laundryServiceProcessId
                ? _value.laundryServiceProcessId
                : laundryServiceProcessId // ignore: cast_nullable_to_non_nullable
                      as int?,
            processId: freezed == processId
                ? _value.processId
                : processId // ignore: cast_nullable_to_non_nullable
                      as int?,
            processName: freezed == processName
                ? _value.processName
                : processName // ignore: cast_nullable_to_non_nullable
                      as String?,
            sequenceNumber: freezed == sequenceNumber
                ? _value.sequenceNumber
                : sequenceNumber // ignore: cast_nullable_to_non_nullable
                      as int?,
            status: freezed == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            employeeId: freezed == employeeId
                ? _value.employeeId
                : employeeId // ignore: cast_nullable_to_non_nullable
                      as int?,
            employeeName: freezed == employeeName
                ? _value.employeeName
                : employeeName // ignore: cast_nullable_to_non_nullable
                      as String?,
            qtyProcessed: freezed == qtyProcessed
                ? _value.qtyProcessed
                : qtyProcessed // ignore: cast_nullable_to_non_nullable
                      as double?,
            evidenceAttachment: freezed == evidenceAttachment
                ? _value.evidenceAttachment
                : evidenceAttachment // ignore: cast_nullable_to_non_nullable
                      as String?,
            evidenceUrl: freezed == evidenceUrl
                ? _value.evidenceUrl
                : evidenceUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            hasEvidence: null == hasEvidence
                ? _value.hasEvidence
                : hasEvidence // ignore: cast_nullable_to_non_nullable
                      as bool,
            canStart: null == canStart
                ? _value.canStart
                : canStart // ignore: cast_nullable_to_non_nullable
                      as bool,
            canComplete: null == canComplete
                ? _value.canComplete
                : canComplete // ignore: cast_nullable_to_non_nullable
                      as bool,
            canWork: null == canWork
                ? _value.canWork
                : canWork // ignore: cast_nullable_to_non_nullable
                      as bool,
            actionDeniedReason: freezed == actionDeniedReason
                ? _value.actionDeniedReason
                : actionDeniedReason // ignore: cast_nullable_to_non_nullable
                      as String?,
            startedAt: freezed == startedAt
                ? _value.startedAt
                : startedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            completedAt: freezed == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedStartedAt: freezed == formattedStartedAt
                ? _value.formattedStartedAt
                : formattedStartedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedCompletedAt: freezed == formattedCompletedAt
                ? _value.formattedCompletedAt
                : formattedCompletedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            isCompleted: null == isCompleted
                ? _value.isCompleted
                : isCompleted // ignore: cast_nullable_to_non_nullable
                      as bool,
            isInProgress: null == isInProgress
                ? _value.isInProgress
                : isInProgress // ignore: cast_nullable_to_non_nullable
                      as bool,
            isPending: null == isPending
                ? _value.isPending
                : isPending // ignore: cast_nullable_to_non_nullable
                      as bool,
            processingDuration: freezed == processingDuration
                ? _value.processingDuration
                : processingDuration // ignore: cast_nullable_to_non_nullable
                      as int?,
            completionPercentage: freezed == completionPercentage
                ? _value.completionPercentage
                : completionPercentage // ignore: cast_nullable_to_non_nullable
                      as double?,
            commissionAmount: freezed == commissionAmount
                ? _value.commissionAmount
                : commissionAmount // ignore: cast_nullable_to_non_nullable
                      as double?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedCreatedAt: freezed == formattedCreatedAt
                ? _value.formattedCreatedAt
                : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedUpdatedAt: freezed == formattedUpdatedAt
                ? _value.formattedUpdatedAt
                : formattedUpdatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OrderItemProcessModelImplCopyWith<$Res>
    implements $OrderItemProcessModelCopyWith<$Res> {
  factory _$$OrderItemProcessModelImplCopyWith(
    _$OrderItemProcessModelImpl value,
    $Res Function(_$OrderItemProcessModelImpl) then,
  ) = __$$OrderItemProcessModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int? orderItemId,
    int? laundryServiceProcessId,
    int? processId,
    String? processName,
    int? sequenceNumber,
    String? status,
    String? statusLabel,
    int? employeeId,
    String? employeeName,
    double? qtyProcessed,
    String? evidenceAttachment,
    String? evidenceUrl,
    bool hasEvidence,
    bool canStart,
    bool canComplete,
    bool canWork,
    String? actionDeniedReason,
    DateTime? startedAt,
    DateTime? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,
    bool isCompleted,
    bool isInProgress,
    bool isPending,
    int? processingDuration,
    double? completionPercentage,
    double? commissionAmount,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  });
}

/// @nodoc
class __$$OrderItemProcessModelImplCopyWithImpl<$Res>
    extends
        _$OrderItemProcessModelCopyWithImpl<$Res, _$OrderItemProcessModelImpl>
    implements _$$OrderItemProcessModelImplCopyWith<$Res> {
  __$$OrderItemProcessModelImplCopyWithImpl(
    _$OrderItemProcessModelImpl _value,
    $Res Function(_$OrderItemProcessModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderItemProcessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderItemId = freezed,
    Object? laundryServiceProcessId = freezed,
    Object? processId = freezed,
    Object? processName = freezed,
    Object? sequenceNumber = freezed,
    Object? status = freezed,
    Object? statusLabel = freezed,
    Object? employeeId = freezed,
    Object? employeeName = freezed,
    Object? qtyProcessed = freezed,
    Object? evidenceAttachment = freezed,
    Object? evidenceUrl = freezed,
    Object? hasEvidence = null,
    Object? canStart = null,
    Object? canComplete = null,
    Object? canWork = null,
    Object? actionDeniedReason = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? formattedStartedAt = freezed,
    Object? formattedCompletedAt = freezed,
    Object? isCompleted = null,
    Object? isInProgress = null,
    Object? isPending = null,
    Object? processingDuration = freezed,
    Object? completionPercentage = freezed,
    Object? commissionAmount = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
  }) {
    return _then(
      _$OrderItemProcessModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        orderItemId: freezed == orderItemId
            ? _value.orderItemId
            : orderItemId // ignore: cast_nullable_to_non_nullable
                  as int?,
        laundryServiceProcessId: freezed == laundryServiceProcessId
            ? _value.laundryServiceProcessId
            : laundryServiceProcessId // ignore: cast_nullable_to_non_nullable
                  as int?,
        processId: freezed == processId
            ? _value.processId
            : processId // ignore: cast_nullable_to_non_nullable
                  as int?,
        processName: freezed == processName
            ? _value.processName
            : processName // ignore: cast_nullable_to_non_nullable
                  as String?,
        sequenceNumber: freezed == sequenceNumber
            ? _value.sequenceNumber
            : sequenceNumber // ignore: cast_nullable_to_non_nullable
                  as int?,
        status: freezed == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        employeeId: freezed == employeeId
            ? _value.employeeId
            : employeeId // ignore: cast_nullable_to_non_nullable
                  as int?,
        employeeName: freezed == employeeName
            ? _value.employeeName
            : employeeName // ignore: cast_nullable_to_non_nullable
                  as String?,
        qtyProcessed: freezed == qtyProcessed
            ? _value.qtyProcessed
            : qtyProcessed // ignore: cast_nullable_to_non_nullable
                  as double?,
        evidenceAttachment: freezed == evidenceAttachment
            ? _value.evidenceAttachment
            : evidenceAttachment // ignore: cast_nullable_to_non_nullable
                  as String?,
        evidenceUrl: freezed == evidenceUrl
            ? _value.evidenceUrl
            : evidenceUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        hasEvidence: null == hasEvidence
            ? _value.hasEvidence
            : hasEvidence // ignore: cast_nullable_to_non_nullable
                  as bool,
        canStart: null == canStart
            ? _value.canStart
            : canStart // ignore: cast_nullable_to_non_nullable
                  as bool,
        canComplete: null == canComplete
            ? _value.canComplete
            : canComplete // ignore: cast_nullable_to_non_nullable
                  as bool,
        canWork: null == canWork
            ? _value.canWork
            : canWork // ignore: cast_nullable_to_non_nullable
                  as bool,
        actionDeniedReason: freezed == actionDeniedReason
            ? _value.actionDeniedReason
            : actionDeniedReason // ignore: cast_nullable_to_non_nullable
                  as String?,
        startedAt: freezed == startedAt
            ? _value.startedAt
            : startedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        completedAt: freezed == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedStartedAt: freezed == formattedStartedAt
            ? _value.formattedStartedAt
            : formattedStartedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedCompletedAt: freezed == formattedCompletedAt
            ? _value.formattedCompletedAt
            : formattedCompletedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        isCompleted: null == isCompleted
            ? _value.isCompleted
            : isCompleted // ignore: cast_nullable_to_non_nullable
                  as bool,
        isInProgress: null == isInProgress
            ? _value.isInProgress
            : isInProgress // ignore: cast_nullable_to_non_nullable
                  as bool,
        isPending: null == isPending
            ? _value.isPending
            : isPending // ignore: cast_nullable_to_non_nullable
                  as bool,
        processingDuration: freezed == processingDuration
            ? _value.processingDuration
            : processingDuration // ignore: cast_nullable_to_non_nullable
                  as int?,
        completionPercentage: freezed == completionPercentage
            ? _value.completionPercentage
            : completionPercentage // ignore: cast_nullable_to_non_nullable
                  as double?,
        commissionAmount: freezed == commissionAmount
            ? _value.commissionAmount
            : commissionAmount // ignore: cast_nullable_to_non_nullable
                  as double?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedCreatedAt: freezed == formattedCreatedAt
            ? _value.formattedCreatedAt
            : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedUpdatedAt: freezed == formattedUpdatedAt
            ? _value.formattedUpdatedAt
            : formattedUpdatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderItemProcessModelImpl extends _OrderItemProcessModel {
  const _$OrderItemProcessModelImpl({
    required this.id,
    this.orderItemId,
    this.laundryServiceProcessId,
    this.processId,
    this.processName,
    this.sequenceNumber,
    this.status,
    this.statusLabel,
    this.employeeId,
    this.employeeName,
    this.qtyProcessed,
    this.evidenceAttachment,
    this.evidenceUrl,
    this.hasEvidence = false,
    this.canStart = false,
    this.canComplete = false,
    this.canWork = false,
    this.actionDeniedReason,
    this.startedAt,
    this.completedAt,
    this.formattedStartedAt,
    this.formattedCompletedAt,
    this.isCompleted = false,
    this.isInProgress = false,
    this.isPending = false,
    this.processingDuration,
    this.completionPercentage,
    this.commissionAmount,
    this.createdAt,
    this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
  }) : super._();

  factory _$OrderItemProcessModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderItemProcessModelImplFromJson(json);

  @override
  final int id;
  @override
  final int? orderItemId;
  @override
  final int? laundryServiceProcessId;
  @override
  final int? processId;
  @override
  final String? processName;
  @override
  final int? sequenceNumber;
  @override
  final String? status;
  @override
  final String? statusLabel;
  @override
  final int? employeeId;
  @override
  final String? employeeName;
  @override
  final double? qtyProcessed;
  @override
  final String? evidenceAttachment;
  @override
  final String? evidenceUrl;
  @override
  @JsonKey()
  final bool hasEvidence;
  @override
  @JsonKey()
  final bool canStart;
  @override
  @JsonKey()
  final bool canComplete;
  @override
  @JsonKey()
  final bool canWork;
  @override
  final String? actionDeniedReason;
  @override
  final DateTime? startedAt;
  @override
  final DateTime? completedAt;
  @override
  final String? formattedStartedAt;
  @override
  final String? formattedCompletedAt;
  @override
  @JsonKey()
  final bool isCompleted;
  @override
  @JsonKey()
  final bool isInProgress;
  @override
  @JsonKey()
  final bool isPending;
  @override
  final int? processingDuration;
  @override
  final double? completionPercentage;
  @override
  final double? commissionAmount;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final String? formattedCreatedAt;
  @override
  final String? formattedUpdatedAt;

  @override
  String toString() {
    return 'OrderItemProcessModel(id: $id, orderItemId: $orderItemId, laundryServiceProcessId: $laundryServiceProcessId, processId: $processId, processName: $processName, sequenceNumber: $sequenceNumber, status: $status, statusLabel: $statusLabel, employeeId: $employeeId, employeeName: $employeeName, qtyProcessed: $qtyProcessed, evidenceAttachment: $evidenceAttachment, evidenceUrl: $evidenceUrl, hasEvidence: $hasEvidence, canStart: $canStart, canComplete: $canComplete, canWork: $canWork, actionDeniedReason: $actionDeniedReason, startedAt: $startedAt, completedAt: $completedAt, formattedStartedAt: $formattedStartedAt, formattedCompletedAt: $formattedCompletedAt, isCompleted: $isCompleted, isInProgress: $isInProgress, isPending: $isPending, processingDuration: $processingDuration, completionPercentage: $completionPercentage, commissionAmount: $commissionAmount, createdAt: $createdAt, updatedAt: $updatedAt, formattedCreatedAt: $formattedCreatedAt, formattedUpdatedAt: $formattedUpdatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderItemProcessModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.orderItemId, orderItemId) ||
                other.orderItemId == orderItemId) &&
            (identical(
                  other.laundryServiceProcessId,
                  laundryServiceProcessId,
                ) ||
                other.laundryServiceProcessId == laundryServiceProcessId) &&
            (identical(other.processId, processId) ||
                other.processId == processId) &&
            (identical(other.processName, processName) ||
                other.processName == processName) &&
            (identical(other.sequenceNumber, sequenceNumber) ||
                other.sequenceNumber == sequenceNumber) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.employeeId, employeeId) ||
                other.employeeId == employeeId) &&
            (identical(other.employeeName, employeeName) ||
                other.employeeName == employeeName) &&
            (identical(other.qtyProcessed, qtyProcessed) ||
                other.qtyProcessed == qtyProcessed) &&
            (identical(other.evidenceAttachment, evidenceAttachment) ||
                other.evidenceAttachment == evidenceAttachment) &&
            (identical(other.evidenceUrl, evidenceUrl) ||
                other.evidenceUrl == evidenceUrl) &&
            (identical(other.hasEvidence, hasEvidence) ||
                other.hasEvidence == hasEvidence) &&
            (identical(other.canStart, canStart) ||
                other.canStart == canStart) &&
            (identical(other.canComplete, canComplete) ||
                other.canComplete == canComplete) &&
            (identical(other.canWork, canWork) || other.canWork == canWork) &&
            (identical(other.actionDeniedReason, actionDeniedReason) ||
                other.actionDeniedReason == actionDeniedReason) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.formattedStartedAt, formattedStartedAt) ||
                other.formattedStartedAt == formattedStartedAt) &&
            (identical(other.formattedCompletedAt, formattedCompletedAt) ||
                other.formattedCompletedAt == formattedCompletedAt) &&
            (identical(other.isCompleted, isCompleted) ||
                other.isCompleted == isCompleted) &&
            (identical(other.isInProgress, isInProgress) ||
                other.isInProgress == isInProgress) &&
            (identical(other.isPending, isPending) ||
                other.isPending == isPending) &&
            (identical(other.processingDuration, processingDuration) ||
                other.processingDuration == processingDuration) &&
            (identical(other.completionPercentage, completionPercentage) ||
                other.completionPercentage == completionPercentage) &&
            (identical(other.commissionAmount, commissionAmount) ||
                other.commissionAmount == commissionAmount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.formattedCreatedAt, formattedCreatedAt) ||
                other.formattedCreatedAt == formattedCreatedAt) &&
            (identical(other.formattedUpdatedAt, formattedUpdatedAt) ||
                other.formattedUpdatedAt == formattedUpdatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    orderItemId,
    laundryServiceProcessId,
    processId,
    processName,
    sequenceNumber,
    status,
    statusLabel,
    employeeId,
    employeeName,
    qtyProcessed,
    evidenceAttachment,
    evidenceUrl,
    hasEvidence,
    canStart,
    canComplete,
    canWork,
    actionDeniedReason,
    startedAt,
    completedAt,
    formattedStartedAt,
    formattedCompletedAt,
    isCompleted,
    isInProgress,
    isPending,
    processingDuration,
    completionPercentage,
    commissionAmount,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
  ]);

  /// Create a copy of OrderItemProcessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderItemProcessModelImplCopyWith<_$OrderItemProcessModelImpl>
  get copyWith =>
      __$$OrderItemProcessModelImplCopyWithImpl<_$OrderItemProcessModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderItemProcessModelImplToJson(this);
  }
}

abstract class _OrderItemProcessModel extends OrderItemProcessModel {
  const factory _OrderItemProcessModel({
    required final int id,
    final int? orderItemId,
    final int? laundryServiceProcessId,
    final int? processId,
    final String? processName,
    final int? sequenceNumber,
    final String? status,
    final String? statusLabel,
    final int? employeeId,
    final String? employeeName,
    final double? qtyProcessed,
    final String? evidenceAttachment,
    final String? evidenceUrl,
    final bool hasEvidence,
    final bool canStart,
    final bool canComplete,
    final bool canWork,
    final String? actionDeniedReason,
    final DateTime? startedAt,
    final DateTime? completedAt,
    final String? formattedStartedAt,
    final String? formattedCompletedAt,
    final bool isCompleted,
    final bool isInProgress,
    final bool isPending,
    final int? processingDuration,
    final double? completionPercentage,
    final double? commissionAmount,
    final DateTime? createdAt,
    final DateTime? updatedAt,
    final String? formattedCreatedAt,
    final String? formattedUpdatedAt,
  }) = _$OrderItemProcessModelImpl;
  const _OrderItemProcessModel._() : super._();

  factory _OrderItemProcessModel.fromJson(Map<String, dynamic> json) =
      _$OrderItemProcessModelImpl.fromJson;

  @override
  int get id;
  @override
  int? get orderItemId;
  @override
  int? get laundryServiceProcessId;
  @override
  int? get processId;
  @override
  String? get processName;
  @override
  int? get sequenceNumber;
  @override
  String? get status;
  @override
  String? get statusLabel;
  @override
  int? get employeeId;
  @override
  String? get employeeName;
  @override
  double? get qtyProcessed;
  @override
  String? get evidenceAttachment;
  @override
  String? get evidenceUrl;
  @override
  bool get hasEvidence;
  @override
  bool get canStart;
  @override
  bool get canComplete;
  @override
  bool get canWork;
  @override
  String? get actionDeniedReason;
  @override
  DateTime? get startedAt;
  @override
  DateTime? get completedAt;
  @override
  String? get formattedStartedAt;
  @override
  String? get formattedCompletedAt;
  @override
  bool get isCompleted;
  @override
  bool get isInProgress;
  @override
  bool get isPending;
  @override
  int? get processingDuration;
  @override
  double? get completionPercentage;
  @override
  double? get commissionAmount;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  String? get formattedCreatedAt;
  @override
  String? get formattedUpdatedAt;

  /// Create a copy of OrderItemProcessModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderItemProcessModelImplCopyWith<_$OrderItemProcessModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
