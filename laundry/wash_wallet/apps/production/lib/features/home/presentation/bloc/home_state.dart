import 'package:equatable/equatable.dart';
import '../../domain/entities/home.dart';

sealed class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {
  const HomeInitial();
}

class HomeLoading extends HomeState {
  const HomeLoading();
}

class HomeLoaded extends HomeState {
  final Home homeData;

  const HomeLoaded({required this.homeData});

  HomeLoaded copyWith({Home? homeData}) {
    return HomeLoaded(homeData: homeData ?? this.homeData);
  }

  @override
  List<Object?> get props => [homeData];
}

class HomeError extends HomeState {
  final String message;

  const HomeError(this.message);

  @override
  List<Object?> get props => [message];
}
