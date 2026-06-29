// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'wa_notification_preview_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WaNotificationPreviewModel _$WaNotificationPreviewModelFromJson(
  Map<String, dynamic> json,
) {
  return _WaNotificationPreviewModel.fromJson(json);
}

/// @nodoc
mixin _$WaNotificationPreviewModel {
  int get orderId => throw _privateConstructorUsedError;
  String get customerName => throw _privateConstructorUsedError;
  String? get customerPhone => throw _privateConstructorUsedError;
  bool get hasPhone => throw _privateConstructorUsedError;
  String get messagePreview => throw _privateConstructorUsedError;
  int get coinPrice => throw _privateConstructorUsedError;
  bool get hasEnoughCoin => throw _privateConstructorUsedError;
  String? get coinSource => throw _privateConstructorUsedError;
  int get outletCoinBalance => throw _privateConstructorUsedError;
  int get ownerCoinBalance => throw _privateConstructorUsedError;

  /// Serializes this WaNotificationPreviewModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WaNotificationPreviewModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WaNotificationPreviewModelCopyWith<WaNotificationPreviewModel>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WaNotificationPreviewModelCopyWith<$Res> {
  factory $WaNotificationPreviewModelCopyWith(
    WaNotificationPreviewModel value,
    $Res Function(WaNotificationPreviewModel) then,
  ) =
      _$WaNotificationPreviewModelCopyWithImpl<
        $Res,
        WaNotificationPreviewModel
      >;
  @useResult
  $Res call({
    int orderId,
    String customerName,
    String? customerPhone,
    bool hasPhone,
    String messagePreview,
    int coinPrice,
    bool hasEnoughCoin,
    String? coinSource,
    int outletCoinBalance,
    int ownerCoinBalance,
  });
}

/// @nodoc
class _$WaNotificationPreviewModelCopyWithImpl<
  $Res,
  $Val extends WaNotificationPreviewModel
>
    implements $WaNotificationPreviewModelCopyWith<$Res> {
  _$WaNotificationPreviewModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WaNotificationPreviewModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? customerName = null,
    Object? customerPhone = freezed,
    Object? hasPhone = null,
    Object? messagePreview = null,
    Object? coinPrice = null,
    Object? hasEnoughCoin = null,
    Object? coinSource = freezed,
    Object? outletCoinBalance = null,
    Object? ownerCoinBalance = null,
  }) {
    return _then(
      _value.copyWith(
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as int,
            customerName: null == customerName
                ? _value.customerName
                : customerName // ignore: cast_nullable_to_non_nullable
                      as String,
            customerPhone: freezed == customerPhone
                ? _value.customerPhone
                : customerPhone // ignore: cast_nullable_to_non_nullable
                      as String?,
            hasPhone: null == hasPhone
                ? _value.hasPhone
                : hasPhone // ignore: cast_nullable_to_non_nullable
                      as bool,
            messagePreview: null == messagePreview
                ? _value.messagePreview
                : messagePreview // ignore: cast_nullable_to_non_nullable
                      as String,
            coinPrice: null == coinPrice
                ? _value.coinPrice
                : coinPrice // ignore: cast_nullable_to_non_nullable
                      as int,
            hasEnoughCoin: null == hasEnoughCoin
                ? _value.hasEnoughCoin
                : hasEnoughCoin // ignore: cast_nullable_to_non_nullable
                      as bool,
            coinSource: freezed == coinSource
                ? _value.coinSource
                : coinSource // ignore: cast_nullable_to_non_nullable
                      as String?,
            outletCoinBalance: null == outletCoinBalance
                ? _value.outletCoinBalance
                : outletCoinBalance // ignore: cast_nullable_to_non_nullable
                      as int,
            ownerCoinBalance: null == ownerCoinBalance
                ? _value.ownerCoinBalance
                : ownerCoinBalance // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WaNotificationPreviewModelImplCopyWith<$Res>
    implements $WaNotificationPreviewModelCopyWith<$Res> {
  factory _$$WaNotificationPreviewModelImplCopyWith(
    _$WaNotificationPreviewModelImpl value,
    $Res Function(_$WaNotificationPreviewModelImpl) then,
  ) = __$$WaNotificationPreviewModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int orderId,
    String customerName,
    String? customerPhone,
    bool hasPhone,
    String messagePreview,
    int coinPrice,
    bool hasEnoughCoin,
    String? coinSource,
    int outletCoinBalance,
    int ownerCoinBalance,
  });
}

/// @nodoc
class __$$WaNotificationPreviewModelImplCopyWithImpl<$Res>
    extends
        _$WaNotificationPreviewModelCopyWithImpl<
          $Res,
          _$WaNotificationPreviewModelImpl
        >
    implements _$$WaNotificationPreviewModelImplCopyWith<$Res> {
  __$$WaNotificationPreviewModelImplCopyWithImpl(
    _$WaNotificationPreviewModelImpl _value,
    $Res Function(_$WaNotificationPreviewModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WaNotificationPreviewModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? customerName = null,
    Object? customerPhone = freezed,
    Object? hasPhone = null,
    Object? messagePreview = null,
    Object? coinPrice = null,
    Object? hasEnoughCoin = null,
    Object? coinSource = freezed,
    Object? outletCoinBalance = null,
    Object? ownerCoinBalance = null,
  }) {
    return _then(
      _$WaNotificationPreviewModelImpl(
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as int,
        customerName: null == customerName
            ? _value.customerName
            : customerName // ignore: cast_nullable_to_non_nullable
                  as String,
        customerPhone: freezed == customerPhone
            ? _value.customerPhone
            : customerPhone // ignore: cast_nullable_to_non_nullable
                  as String?,
        hasPhone: null == hasPhone
            ? _value.hasPhone
            : hasPhone // ignore: cast_nullable_to_non_nullable
                  as bool,
        messagePreview: null == messagePreview
            ? _value.messagePreview
            : messagePreview // ignore: cast_nullable_to_non_nullable
                  as String,
        coinPrice: null == coinPrice
            ? _value.coinPrice
            : coinPrice // ignore: cast_nullable_to_non_nullable
                  as int,
        hasEnoughCoin: null == hasEnoughCoin
            ? _value.hasEnoughCoin
            : hasEnoughCoin // ignore: cast_nullable_to_non_nullable
                  as bool,
        coinSource: freezed == coinSource
            ? _value.coinSource
            : coinSource // ignore: cast_nullable_to_non_nullable
                  as String?,
        outletCoinBalance: null == outletCoinBalance
            ? _value.outletCoinBalance
            : outletCoinBalance // ignore: cast_nullable_to_non_nullable
                  as int,
        ownerCoinBalance: null == ownerCoinBalance
            ? _value.ownerCoinBalance
            : ownerCoinBalance // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WaNotificationPreviewModelImpl extends _WaNotificationPreviewModel {
  const _$WaNotificationPreviewModelImpl({
    required this.orderId,
    required this.customerName,
    this.customerPhone,
    required this.hasPhone,
    required this.messagePreview,
    required this.coinPrice,
    required this.hasEnoughCoin,
    this.coinSource,
    required this.outletCoinBalance,
    required this.ownerCoinBalance,
  }) : super._();

  factory _$WaNotificationPreviewModelImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$WaNotificationPreviewModelImplFromJson(json);

  @override
  final int orderId;
  @override
  final String customerName;
  @override
  final String? customerPhone;
  @override
  final bool hasPhone;
  @override
  final String messagePreview;
  @override
  final int coinPrice;
  @override
  final bool hasEnoughCoin;
  @override
  final String? coinSource;
  @override
  final int outletCoinBalance;
  @override
  final int ownerCoinBalance;

  @override
  String toString() {
    return 'WaNotificationPreviewModel(orderId: $orderId, customerName: $customerName, customerPhone: $customerPhone, hasPhone: $hasPhone, messagePreview: $messagePreview, coinPrice: $coinPrice, hasEnoughCoin: $hasEnoughCoin, coinSource: $coinSource, outletCoinBalance: $outletCoinBalance, ownerCoinBalance: $ownerCoinBalance)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WaNotificationPreviewModelImpl &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.customerName, customerName) ||
                other.customerName == customerName) &&
            (identical(other.customerPhone, customerPhone) ||
                other.customerPhone == customerPhone) &&
            (identical(other.hasPhone, hasPhone) ||
                other.hasPhone == hasPhone) &&
            (identical(other.messagePreview, messagePreview) ||
                other.messagePreview == messagePreview) &&
            (identical(other.coinPrice, coinPrice) ||
                other.coinPrice == coinPrice) &&
            (identical(other.hasEnoughCoin, hasEnoughCoin) ||
                other.hasEnoughCoin == hasEnoughCoin) &&
            (identical(other.coinSource, coinSource) ||
                other.coinSource == coinSource) &&
            (identical(other.outletCoinBalance, outletCoinBalance) ||
                other.outletCoinBalance == outletCoinBalance) &&
            (identical(other.ownerCoinBalance, ownerCoinBalance) ||
                other.ownerCoinBalance == ownerCoinBalance));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    orderId,
    customerName,
    customerPhone,
    hasPhone,
    messagePreview,
    coinPrice,
    hasEnoughCoin,
    coinSource,
    outletCoinBalance,
    ownerCoinBalance,
  );

  /// Create a copy of WaNotificationPreviewModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WaNotificationPreviewModelImplCopyWith<_$WaNotificationPreviewModelImpl>
  get copyWith =>
      __$$WaNotificationPreviewModelImplCopyWithImpl<
        _$WaNotificationPreviewModelImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$WaNotificationPreviewModelImplToJson(this);
  }
}

abstract class _WaNotificationPreviewModel extends WaNotificationPreviewModel {
  const factory _WaNotificationPreviewModel({
    required final int orderId,
    required final String customerName,
    final String? customerPhone,
    required final bool hasPhone,
    required final String messagePreview,
    required final int coinPrice,
    required final bool hasEnoughCoin,
    final String? coinSource,
    required final int outletCoinBalance,
    required final int ownerCoinBalance,
  }) = _$WaNotificationPreviewModelImpl;
  const _WaNotificationPreviewModel._() : super._();

  factory _WaNotificationPreviewModel.fromJson(Map<String, dynamic> json) =
      _$WaNotificationPreviewModelImpl.fromJson;

  @override
  int get orderId;
  @override
  String get customerName;
  @override
  String? get customerPhone;
  @override
  bool get hasPhone;
  @override
  String get messagePreview;
  @override
  int get coinPrice;
  @override
  bool get hasEnoughCoin;
  @override
  String? get coinSource;
  @override
  int get outletCoinBalance;
  @override
  int get ownerCoinBalance;

  /// Create a copy of WaNotificationPreviewModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WaNotificationPreviewModelImplCopyWith<_$WaNotificationPreviewModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
