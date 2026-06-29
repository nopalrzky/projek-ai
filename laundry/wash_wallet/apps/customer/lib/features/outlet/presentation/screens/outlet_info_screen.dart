import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/outlet_cubit.dart';
import '../bloc/outlet_state.dart';
import '../../../order_review/presentation/bloc/order_review_cubit.dart';
import '../../../order_review/presentation/bloc/order_review_state.dart';
import '../widgets/outlet_info_details_card_widget.dart';
import '../widgets/outlet_info_rating_filter_bar_widget.dart';
import '../widgets/outlet_info_rating_summary_card_widget.dart';
import '../widgets/outlet_info_reviews_list_widget.dart';

class OutletInfoScreen extends StatefulWidget {
  final int outletId;

  const OutletInfoScreen({super.key, required this.outletId});

  @override
  State<OutletInfoScreen> createState() => _OutletInfoScreenState();
}

class _OutletInfoScreenState extends State<OutletInfoScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderReviewCubit>().getReviewsAndSummary(
        outletId: widget.outletId,
      );
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      final reviewCubit = context.read<OrderReviewCubit>();
      final reviewState = reviewCubit.state;
      if (!reviewState.isLoadingReviews && !reviewState.hasReachedMax) {
        reviewCubit.getAll(
          outletId: widget.outletId,
          page: reviewState.currentPage + 1,
        );
      }
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OutletCubit, OutletState>(
      builder: (context, state) {
        if (state is! OutletDetailLoaded) {
          return const Scaffold(body: Center(child: AppLoadingIndicator()));
        }

        final outlet = state.outlet;

        return AppLayout(
          header: AppHeader(
            title: 'Informasi Outlet',
            onBackPressed: () => context.pop(),
          ),
          body: SingleChildScrollView(
            controller: _scrollController,
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OutletInfoDetailsCardWidget(outlet: outlet),
                SizedBox(height: context.space.xl),
                Text(
                  'Rating & Ulasan',
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
                SizedBox(height: context.space.md),
                BlocBuilder<OrderReviewCubit, OrderReviewState>(
                  builder: (context, reviewState) {
                    if (reviewState.isLoadingReviews &&
                        reviewState.reviews.isEmpty) {
                      return const Center(child: AppLoadingIndicator());
                    }

                    if (reviewState.errorMessage != null &&
                        reviewState.reviews.isEmpty) {
                      return Center(
                        child: Text(
                          reviewState.errorMessage ?? 'Gagal memuat ulasan',
                          style: context.typography.bodyMedium.copyWith(
                            color: context.colors.error,
                          ),
                        ),
                      );
                    }

                    final summary = reviewState.summary;
                    final reviews = reviewState.reviews;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (summary != null) ...[
                          OutletInfoRatingSummaryCardWidget(
                            summary: summary,
                            activeRatingFilter: reviewState.ratingFilter,
                            onStarTap: (starNumber) {
                              context.read<OrderReviewCubit>().setRatingFilter(
                                reviewState.ratingFilter == starNumber
                                    ? null
                                    : starNumber,
                                outletId: widget.outletId,
                              );
                            },
                          ),
                          SizedBox(height: context.space.lg),
                        ],
                        OutletInfoRatingFilterBarWidget(
                          activeFilter: reviewState.ratingFilter,
                          onFilterSelected: (rating) {
                            context.read<OrderReviewCubit>().setRatingFilter(
                              rating,
                              outletId: widget.outletId,
                            );
                          },
                        ),
                        SizedBox(height: context.space.md),
                        OutletInfoReviewsListWidget(reviews: reviews),
                        if (reviewState.isLoadingReviews &&
                            reviewState.reviews.isNotEmpty) ...[
                          SizedBox(height: context.space.md),
                          const Center(child: AppLoadingIndicator()),
                        ],
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
