import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../domain/entities/submit_review_params.dart';

class ReviewBottomSheet extends StatefulWidget {
  final Order order;

  const ReviewBottomSheet({super.key, required this.order});

  @override
  State<ReviewBottomSheet> createState() => _ReviewBottomSheetState();
}

class _ReviewBottomSheetState extends State<ReviewBottomSheet> {
  int _rating = 0;
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<OrderCubit, OrderState>(
      listener: (context, state) {
        if (state.reviewSuccess) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Ulasan berhasil dikirim!')),
          );
        }
      },
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final isSelected = index < _rating;
                return IconButton(
                  icon: Icon(
                    isSelected ? Icons.star_rounded : Icons.star_border_rounded,
                    color: isSelected
                        ? Colors.amber
                        : context.colors.textTertiary,
                    size: 40,
                  ),
                  onPressed: () {
                    setState(() {
                      _rating = index + 1;
                    });
                  },
                );
              }),
            ),
            SizedBox(height: context.space.md),
            AppTextField.outlined(
              controller: _commentController,
              label: 'Komentar (Opsional)',
              hint: 'Bagikan pengalaman Anda...',
              maxLines: 3,
            ),
            SizedBox(height: context.space.lg),
            BlocBuilder<OrderCubit, OrderState>(
              builder: (context, state) {
                return AppButton.primary(
                  label: 'Kirim Ulasan',
                  isLoading: state.isSubmittingReview,
                  onPressed: _rating == 0
                      ? null
                      : () {
                          context.read<OrderCubit>().submitReview(
                            SubmitReviewParams(
                              orderId: widget.order.id,
                              rating: _rating,
                              comment: _commentController.text,
                            ),
                          );
                        },
                  isFullWidth: true,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
