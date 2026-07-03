import 'package:flutter/material.dart';

/// A callback to build the content of a cell for a specific column and row.
typedef CellBuilder<T> = Widget Function(BuildContext context, T row);

/// A callback to extract a comparable value from a row for sorting purposes.
typedef SortExtractor<T> = Comparable? Function(T row);

/// Defines a column in the [AppDataTable].
class DataTableColumnDef<T> {
  /// Unique identifier for this column.
  final String id;

  /// The header text label to display.
  final String header;

  /// A fixed width for this column. If null, the column will use [flex] factor.
  final double? width;

  /// Minimum width untuk kolom flex. Tidak berlaku jika [width] sudah diset.
  final double? minWidth;

  /// The flex factor for this column when [width] is null. Default is 1.
  final int flex;

  /// Builder function to render the cell for each row.
  final CellBuilder<T> cellBuilder;

  /// Whether this column can be sorted.
  final bool sortable;

  /// The extractor function used for sorting if [sortable] is true.
  final SortExtractor<T>? sortExtractor;

  /// Text alignment for the header cell. Default is [TextAlign.left].
  final TextAlign headerAlign;

  /// Text alignment for the data cell. Default is [TextAlign.left].
  final TextAlign cellAlign;

  const DataTableColumnDef({
    required this.id,
    required this.header,
    required this.cellBuilder,
    this.width,
    this.minWidth,
    this.flex = 1,
    this.sortable = false,
    this.sortExtractor,
    this.headerAlign = TextAlign.left,
    this.cellAlign = TextAlign.left,
  }) : assert(
         !sortable || sortExtractor != null,
         'sortExtractor must be provided if sortable is true',
       );
}
