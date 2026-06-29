import 'package:equatable/equatable.dart';

abstract class OnboardingState extends Equatable {
  const OnboardingState();

  @override
  List<Object?> get props => [];
}

class OnboardingInitial extends OnboardingState {}

class OnboardingChecking extends OnboardingState {}

class OnboardingAlreadyCompleted extends OnboardingState {}

class OnboardingRequired extends OnboardingState {}

class OnboardingCompleted extends OnboardingState {}
