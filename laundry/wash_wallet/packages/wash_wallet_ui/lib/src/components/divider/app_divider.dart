import 'package:flutter/material.dart';
import 'app_divider_variant.dart';
import 'app_divider_thickness.dart';
import 'app_divider_density.dart';
import 'app_divider_style.dart';

class AppDivider extends StatelessWidget {
  final AppDividerVariant variant;
  final AppDividerThickness thickness;
  final AppDividerDensity density;
  final bool isVertical;
  final double? width;
  final double? height;
  final EdgeInsets? margin;

  const AppDivider._({
    super.key,
    required this.variant,
    this.thickness = AppDividerThickness.regular,
    this.density = AppDividerDensity.normal,
    this.isVertical = false,
    this.width,
    this.height,
    this.margin,
  });

  const AppDivider({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.defaultVariant,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.soft({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.soft,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.strong({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.thick,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.strong,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.dashed({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.dashed,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.danger({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.danger,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.success({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? width,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.success,
         thickness: thickness,
         density: density,
         isVertical: false,
         width: width,
         margin: margin,
       );

  const AppDivider.vertical({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? height,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.defaultVariant,
         thickness: thickness,
         density: density,
         isVertical: true,
         height: height,
         margin: margin,
       );

  const AppDivider.verticalSoft({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.regular,
    AppDividerDensity density = AppDividerDensity.normal,
    double? height,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.soft,
         thickness: thickness,
         density: density,
         isVertical: true,
         height: height,
         margin: margin,
       );

  const AppDivider.verticalStrong({
    Key? key,
    AppDividerThickness thickness = AppDividerThickness.thick,
    AppDividerDensity density = AppDividerDensity.normal,
    double? height,
    EdgeInsets? margin,
  }) : this._(
         key: key,
         variant: AppDividerVariant.strong,
         thickness: thickness,
         density: density,
         isVertical: true,
         height: height,
         margin: margin,
       );

  @override
  Widget build(BuildContext context) {
    final style = AppDividerStyle(
      variant: variant,
      thickness: thickness,
      density: density,
      isVertical: isVertical,
      context: context,
    );

    Widget divider;

    if (style.isDashed) {
      divider = _buildDashedDivider(style);
    } else {
      divider = _buildSolidDivider(style);
    }

    final effectiveMargin =
        margin ??
        (isVertical
            ? EdgeInsets.symmetric(horizontal: style.spacingBefore)
            : EdgeInsets.symmetric(vertical: style.spacingBefore));

    return Padding(padding: effectiveMargin, child: divider);
  }

  Widget _buildSolidDivider(AppDividerStyle style) {
    if (isVertical) {
      return Container(
        width: style.lineThickness,
        height: height,
        color: style.lineColor,
      );
    } else {
      return Container(
        height: style.lineThickness,
        width: width,
        color: style.lineColor,
      );
    }
  }

  Widget _buildDashedDivider(AppDividerStyle style) {
    return CustomPaint(
      size: Size(
        isVertical ? style.lineThickness : (width ?? double.infinity),
        isVertical ? (height ?? double.infinity) : style.lineThickness,
      ),
      painter: _DashedLinePainter(
        color: style.lineColor,
        thickness: style.lineThickness,
        dashWidth: style.dashWidth,
        dashGap: style.dashGap,
        isVertical: isVertical,
      ),
    );
  }
}

class _DashedLinePainter extends CustomPainter {
  final Color color;
  final double thickness;
  final double dashWidth;
  final double dashGap;
  final bool isVertical;

  _DashedLinePainter({
    required this.color,
    required this.thickness,
    required this.dashWidth,
    required this.dashGap,
    required this.isVertical,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = thickness
      ..style = PaintingStyle.stroke;

    if (isVertical) {
      double startY = 0;
      while (startY < size.height) {
        canvas.drawLine(
          Offset(thickness / 2, startY),
          Offset(thickness / 2, startY + dashWidth),
          paint,
        );
        startY += dashWidth + dashGap;
      }
    } else {
      double startX = 0;
      while (startX < size.width) {
        canvas.drawLine(
          Offset(startX, thickness / 2),
          Offset(startX + dashWidth, thickness / 2),
          paint,
        );
        startX += dashWidth + dashGap;
      }
    }
  }

  @override
  bool shouldRepaint(_DashedLinePainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.thickness != thickness ||
        oldDelegate.dashWidth != dashWidth ||
        oldDelegate.dashGap != dashGap ||
        oldDelegate.isVertical != isVertical;
  }
}
