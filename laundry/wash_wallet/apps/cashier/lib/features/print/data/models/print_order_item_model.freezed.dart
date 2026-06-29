// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'print_order_item_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PrintOrderItemModel _$PrintOrderItemModelFromJson(Map<String, dynamic> json) {
  return _PrintOrderItemModel.fromJson(json);
}

/// @nodoc
mixin _$PrintOrderItemModel {
  String get laundryServiceName => throw _privateConstructorUsedError;
  double get quantity => throw _privateConstructorUsedError;
  String get unitName => throw _privateConstructorUsedError;
  double get unitPrice => throw _privateConstructorUsedError;
  double get totalAmount => throw _privateConstructorUsedError;

  /// Serializes this PrintOrderItemModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PrintOrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PrintOrderItemModelCopyWith<PrintOrderItemModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PrintOrderItemModelCopyWith<$Res> {
  factory $PrintOrderItemModelCopyWith(
    PrintOrderItemModel value,
    $Res Function(PrintOrderItemModel) then,
  ) = _$PrintOrderItemModelCopyWithImpl<$Res, PrintOrderItemModel>;
  @useResult
  $Res call({
    String laundryServiceName,
    double quantity,
    String unitName,
    double unitPrice,
    double totalAmount,
  });
}

/// @nodoc
class _$PrintOrderItemModelCopyWithImpl<$Res, $Val extends PrintOrderItemModel>
    implements $PrintOrderItemModelCopyWith<$Res> {
  _$PrintOrderItemModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PrintOrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? laundryServiceName = null,
    Object? quantity = null,
    Object? unitName = null,
    Object? unitPrice = null,
    Object? totalAmount = null,
  }) {
    return _then(
      _value.copyWith(
            laundryServiceName: null == laundryServiceName
                ? _value.laundryServiceName
                : laundryServiceName // ignore: cast_nullable_to_non_nullable
                      as String,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as double,
            unitName: null == unitName
                ? _value.unitName
                : unitName // ignore: cast_nullable_to_non_nullable
                      as String,
            unitPrice: null == unitPrice
                ? _value.unitPrice
                : unitPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            totalAmount: null == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PrintOrderItemModelImplCopyWith<$Res>
    implements $PrintOrderItemModelCopyWith<$Res> {
  factory _$$PrintOrderItemModelImplCopyWith(
    _$PrintOrderItemModelImpl value,
    $Res Function(_$PrintOrderItemModelImpl) then,
  ) = __$$PrintOrderItemModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String laundryServiceName,
    double quantity,
    String unitName,
    double unitPrice,
    double totalAmount,
  });
}

/// @nodoc
class __$$PrintOrderItemModelImplCopyWithImpl<$Res>
    extends _$PrintOrderItemModelCopyWithImpl<$Res, _$PrintOrderItemModelImpl>
    implements _$$PrintOrderItemModelImplCopyWith<$Res> {
  __$$PrintOrderItemModelImplCopyWithImpl(
    _$PrintOrderItemModelImpl _value,
    $Res Function(_$PrintOrderItemModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PrintOrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? laundryServiceName = null,
    Object? quantity = null,
    Object? unitName = null,
    Object? unitPrice = null,
    Object? totalAmount = null,
  }) {
    return _then(
      _$PrintOrderItemModelImpl(
        laundryServiceName: null == laundryServiceName
            ? _value.laundryServiceName
            : laundryServiceName // ignore: cast_nullable_to_non_nullable
                  as String,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as double,
        unitName: null == unitName
            ? _value.unitName
            : unitName // ignore: cast_nullable_to_non_nullable
                  as String,
        unitPrice: null == unitPrice
            ? _value.unitPrice
            : unitPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        totalAmount: null == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PrintOrderItemModelImpl extends _PrintOrderItemModel {
  const _$PrintOrderItemModelImpl({
    required this.laundryServiceName,
    required this.quantity,
    required this.unitName,
    required this.unitPrice,
    required this.totalAmount,
  }) : super._();

  factory _$PrintOrderItemModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PrintOrderItemModelImplFromJson(json);

  @override
  final String laundryServiceName;
  @override
  final double quantity;
  @override
  final String unitName;
  @override
  final double unitPrice;
  @override
  final double totalAmount;

  @override
  String toString() {
    return 'PrintOrderItemModel(laundryServiceName: $laundryServiceName, quantity: $quantity, unitName: $unitName, unitPrice: $unitPrice, totalAmount: $totalAmount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PrintOrderItemModelImpl &&
            (identical(other.laundryServiceName, laundryServiceName) ||
                other.laundryServiceName == laundryServiceName) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.unitName, unitName) ||
                other.unitName == unitName) &&
            (identical(other.unitPrice, unitPrice) ||
                other.unitPrice == unitPrice) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    laundryServiceName,
    quantity,
    unitName,
    unitPrice,
    totalAmount,
  );

  /// Create a copy of PrintOrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PrintOrderItemModelImplCopyWith<_$PrintOrderItemModelImpl> get copyWith =>
      __$$PrintOrderItemModelImplCopyWithImpl<_$PrintOrderItemModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PrintOrderItemModelImplToJson(this);
  }
}

abstract class _PrintOrderItemModel extends PrintOrderItemModel {
  const factory _PrintOrderItemModel({
    required final String laundryServiceName,
    required final double quantity,
    required final String unitName,
    required final double unitPrice,
    required final double totalAmount,
  }) = _$PrintOrderItemModelImpl;
  const _PrintOrderItemModel._() : super._();

  factory _PrintOrderItemModel.fromJson(Map<String, dynamic> json) =
      _$PrintOrderItemModelImpl.fromJson;

  @override
  String get laundryServiceName;
  @override
  double get quantity;
  @override
  String get unitName;
  @override
  double get unitPrice;
  @override
  double get totalAmount;

  /// Create a copy of PrintOrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PrintOrderItemModelImplCopyWith<_$PrintOrderItemModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
