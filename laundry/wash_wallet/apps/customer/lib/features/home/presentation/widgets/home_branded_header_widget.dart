import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'home_cart_button_widget.dart';
import 'home_search_entry_widget.dart';

class HomeBrandedHeaderWidget extends StatelessWidget {
  final String addressLabel;
  final String addressValue;
  final int cartItemCount;
  final VoidCallback onAddressTap;
  final VoidCallback onCartTap;
  final VoidCallback onSearchTap;

  const HomeBrandedHeaderWidget({
    super.key,
    required this.addressLabel,
    required this.addressValue,
    required this.cartItemCount,
    required this.onAddressTap,
    required this.onCartTap,
    required this.onSearchTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [context.colors.primary, context.colors.primaryDark],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: CustomPaint(
        painter: _HeaderWavePainter(color: context.colors.surface),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              context.space.lg,
              context.space.md,
              context.space.lg,
              context.space.xxl,
            ),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: onAddressTap,
                        behavior: HitTestBehavior.opaque,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              addressLabel,
                              style: context.typography.labelSmall.copyWith(
                                color: Colors.white70,
                              ),
                            ),
                            SizedBox(height: context.space.xxs),
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    addressValue,
                                    style: context.typography.titleMedium
                                        .copyWith(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w700,
                                        ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                SizedBox(width: context.space.xs),
                                const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(width: context.space.md),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.notifications_outlined),
                      color: Colors.white,
                    ),
                    HomeCartButtonWidget(
                      onTap: onCartTap,
                      iconColor: Colors.white,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),
                HomeSearchEntryWidget(onTap: onSearchTap),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HeaderWavePainter extends CustomPainter {
  final Color color;

  _HeaderWavePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(0, size.height);
    path.lineTo(0, size.height - 24);
    path.quadraticBezierTo(
      size.width / 4,
      size.height,
      size.width / 2,
      size.height - 12,
    );
    path.quadraticBezierTo(
      size.width * 3 / 4,
      size.height - 24,
      size.width,
      size.height - 8,
    );
    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
