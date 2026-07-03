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
  final int lastPage;
  final int total;
  final int? from;
  final int? to;
  final int perPage;
  final bool isPageLoading;

  const CategoriesLoaded({
    required this.categories,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.lastPage = 1,
    this.total = 0,
    this.from,
    this.to,
    this.perPage = 15,
    this.isPageLoading = false,
  });

  CategoriesLoaded copyWith({
    List<Category>? categories,
    bool? hasReachedMax,
    int? currentPage,
    int? lastPage,
    int? total,
    int? from,
    int? to,
    int? perPage,
    bool? isPageLoading,
  }) {
    return CategoriesLoaded(
      categories: categories ?? this.categories,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      lastPage: lastPage ?? this.lastPage,
      total: total ?? this.total,
      from: from ?? this.from,
      to: to ?? this.to,
      perPage: perPage ?? this.perPage,
      isPageLoading: isPageLoading ?? this.isPageLoading,
    );
  }

  @override
  List<Object?> get props => [categories, hasReachedMax, currentPage, lastPage, total, from, to, perPage, isPageLoading];
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
