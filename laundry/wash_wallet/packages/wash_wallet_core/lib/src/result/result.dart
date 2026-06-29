import 'package:freezed_annotation/freezed_annotation.dart';
import '../failures/failure.dart';

part 'result.freezed.dart';

@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(Failure failure) = _Failure<T>;

  const Result._();

  bool get isSuccess => this is Success<T>;

  bool get isFailure => this is _Failure<T>;

  T? get dataOrNull => when(success: (data) => data, failure: (_) => null);

  Failure? get failureOrNull =>
      when(success: (_) => null, failure: (failure) => failure);
}
