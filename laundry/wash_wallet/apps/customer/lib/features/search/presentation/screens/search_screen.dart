import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../data/search_history_service.dart';
import '../widgets/search_history_section_widget.dart';
import '../widgets/search_screen_header_widget.dart';
import '../widgets/search_suggested_section_widget.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  final _historyService = SearchHistoryService();

  List<String> _history = [];
  bool _isLoadingHistory = true;

  static const _defaultSuggestions = [
    'Cuci kiloan',
    'Cuci kering',
    'Express',
    'Setrika',
    'Karpet',
    'Bed cover',
    'Sepatu',
    'Jas',
  ];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    final history = await _historyService.getHistory();
    if (!mounted) return;
    setState(() {
      _history = history;
      _isLoadingHistory = false;
    });
  }

  void _submitSearch(String query) async {
    final trimmedQuery = query.trim();
    if (trimmedQuery.isEmpty) return;

    await _historyService.addToHistory(trimmedQuery);

    if (!mounted) return;
    context.pushReplacement(
      '/discovery?query=${Uri.encodeComponent(trimmedQuery)}',
    );
  }

  void _clearSearch() {
    _searchController.clear();
  }

  Future<void> _clearHistory() async {
    await _historyService.clearHistory();
    _loadHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: Column(
          children: [
            SearchScreenHeaderWidget(
              controller: _searchController,
              onSubmitted: _submitSearch,
              onClear: _clearSearch,
            ),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.lg,
                  vertical: context.space.md,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!_isLoadingHistory && _history.isNotEmpty) ...[
                      SearchHistorySectionWidget(
                        history: _history,
                        onSelect: _submitSearch,
                        onClearAll: _clearHistory,
                      ),
                      SizedBox(height: context.space.xxl),
                    ],
                    SearchSuggestedSectionWidget(
                      suggestions: _defaultSuggestions,
                      onSelect: _submitSearch,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
