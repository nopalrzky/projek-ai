// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'print_coin_info_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PrintCoinInfoModel _$PrintCoinInfoModelFromJson(Map<String, dynamic> json) {
  return _PrintCoinInfoModel.fromJson(json);
}

/// @nodoc
mixin _$PrintCoinInfoModel {
  int get coinPrice => throw _privateConstructorUsedError;
  bool get featureActive => throw _privateConstructorUsedError;
  bool get hasEnoughCoin => throw _privateConstructorUsedError;
  String? get coinSource => throw _privateConstructorUsedError;
  int get outletCoinBalance => throw _privateConstructorUsedError;
  int get ownerCoinBalance => throw _privateConstructorUsedError;

  /// Serializes this PrintCoinInfoModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PrintCoinInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PrintCoinInfoModelCopyWith<PrintCoinInfoModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PrintCoinInfoModelCopyWith<$Res> {
  factory $PrintCoinInfoModelCopyWith(
    PrintCoinInfoModel value,
    $Res Function(PrintCoinInfoModel) then,
  ) = _$PrintCoinInfoModelCopyWithImpl<$Res, PrintCoinInfoModel>;
  @useResult
  $Res call({
    int coinPrice,
    bool featureActive,
    bool hasEnoughCoin,
    String? coinSource,
    int outletCoinBalance,
    int ownerCoinBalance,
  });
}

/// @nodoc
class _$PrintCoinInfoModelCopyWithImpl<$Res, $Val extends PrintCoinInfoModel>
    implements $PrintCoinInfoModelCopyWith<$Res> {
  _$PrintCoinInfoModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PrintCoinInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coinPrice = null,
    Object? featureActive = null,
    Object? hasEnoughCoin = null,
    Object? coinSource = freezed,
    Object? outletCoinBalance = null,
    Object? ownerCoinBalance = null,
  }) {
    return _then(
      _value.copyWith(
            coinPrice: null == coinPrice
                ? _value.coinPrice
                : coinPrice // ignore: cast_nullable_to_non_nullable
                      as int,
            featureActive: null == featureActive
                ? _value.featureActive
                : featureActive // ignore: cast_nullable_to_non_nullable
                      as bool,
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
abstract class _$$PrintCoinInfoModelImplCopyWith<$Res>
    implements $PrintCoinInfoModelCopyWith<$Res> {
  factory _$$PrintCoinInfoModelImplCopyWith(
    _$PrintCoinInfoModelImpl value,
    $Res Function(_$PrintCoinInfoModelImpl) then,
  ) = __$$PrintCoinInfoModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int coinPrice,
    bool featureActive,
    bool hasEnoughCoin,
    String? coinSource,
    int outletCoinBalance,
    int ownerCoinBalance,
  });
}

/// @nodoc
class __$$PrintCoinInfoModelImplCopyWithImpl<$Res>
    extends _$PrintCoinInfoModelCopyWithImpl<$Res, _$PrintCoinInfoModelImpl>
    implements _$$PrintCoinInfoModelImplCopyWith<$Res> {
  __$$PrintCoinInfoModelImplCopyWithImpl(
    _$PrintCoinInfoModelImpl _value,
    $Res Function(_$PrintCoinInfoModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PrintCoinInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coinPrice = null,
    Object? featureActive = null,
    Object? hasEnoughCoin = null,
    Object? coinSource = freezed,
    Object? outletCoinBalance = null,
    Object? ownerCoinBalance = null,
  }) {
    return _then(
      _$PrintCoinInfoModelImpl(
        coinPrice: null == coinPrice
            ? _value.coinPrice
            : coinPrice // ignore: cast_nullable_to_non_nullable
                  as int,
        featureActive: null == featureActive
            ? _value.featureActive
            : featureActive // ignore: cast_nullable_to_non_nullable
                  as bool,
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
class _$PrintCoinInfoModelImpl extends _PrintCoinInfoModel {
  const _$PrintCoinInfoModelImpl({
    required this.coinPrice,
    required this.featureActive,
    required this.hasEnoughCoin,
    this.coinSource,
    required this.outletCoinBalance,
    required this.ownerCoinBalance,
  }) : super._();

  factory _$PrintCoinInfoModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PrintCoinInfoModelImplFromJson(json);

  @override
  final int coinPrice;
  @override
  final bool featureActive;
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
    return 'PrintCoinInfoModel(coinPrice: $coinPrice, featureActive: $featureActive, hasEnoughCoin: $hasEnoughCoin, coinSource: $coinSource, outletCoinBalance: $outletCoinBalance, ownerCoinBalance: $ownerCoinBalance)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PrintCoinInfoModelImpl &&
            (identical(other.coinPrice, coinPrice) ||
                other.coinPrice == coinPrice) &&
            (identical(other.featureActive, featureActive) ||
                other.featureActive == featureActive) &&
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
    coinPrice,
    featureActive,
    hasEnoughCoin,
    coinSource,
    outletCoinBalance,
    ownerCoinBalance,
  );

  /// Create a copy of PrintCoinInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PrintCoinInfoModelImplCopyWith<_$PrintCoinInfoModelImpl> get copyWith =>
      __$$PrintCoinInfoModelImplCopyWithImpl<_$PrintCoinInfoModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PrintCoinInfoModelImplToJson(this);
  }
}

abstract class _PrintCoinInfoModel extends PrintCoinInfoModel {
  const factory _PrintCoinInfoModel({
    required final int coinPrice,
    required final bool featureActive,
    required final bool hasEnoughCoin,
    final String? coinSource,
    required final int outletCoinBalance,
    required final int ownerCoinBalance,
  }) = _$PrintCoinInfoModelImpl;
  const _PrintCoinInfoModel._() : super._();

  factory _PrintCoinInfoModel.fromJson(Map<String, dynamic> json) =
      _$PrintCoinInfoModelImpl.fromJson;

  @override
  int get coinPrice;
  @override
  bool get featureActive;
  @override
  bool get hasEnoughCoin;
  @override
  String? get coinSource;
  @override
  int get outletCoinBalance;
  @override
  int get ownerCoinBalance;

  /// Create a copy of PrintCoinInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PrintCoinInfoModelImplCopyWith<_$PrintCoinInfoModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
