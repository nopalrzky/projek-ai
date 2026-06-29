import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class CategoryState extends Equatable {
  const CategoryState();

  @override
  List<Object?> get props => [];
}

class CategoryInitial extends CategoryState {
  const CategoryInitial();
}

class CategoryLoading extends CategoryState {
  const CategoryLoading();
}

class CategoriesLoaded extends CategoryState {
  final List<Category> categories;
  final bool hasReachedMax;
  final int currentPage;

  const CategoriesLoaded({
    required this.categories,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  CategoriesLoaded copyWith({
    List<Category>? categories,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return CategoriesLoaded(
      categories: categories ?? this.categories,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [categories, hasReachedMax, currentPage];
}

class CategoryDetailLoaded extends CategoryState {
  final Category category;

  const CategoryDetailLoaded(this.category);

  @override
  List<Object?> get props => [category];
}

class CategoryActionSuccess extends CategoryState {
  final String message;
  final Category? category;

  const CategoryActionSuccess(this.message, {this.category});

  @override
  List<Object?> get props => [message, category];
}

class CategoryFailure extends CategoryState {
  final Failure failure;

  const CategoryFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
