import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

void main() {
  group('OutletModel.fromJson', () {
    Map<String, dynamic> baseJson() => {
      'id': 1,
      'name': 'Test Outlet',
      'status': 'active',
      'isCurrentlyOpen': false,
    };

    test('does not throw when todaySchedule is empty list (closed outlet)', () {
      final json = {
        ...baseJson(),
        'todaySchedule': [],
        'todayHours': [],
        'weeklyHours': [],
        'operationalStatus': 'closed_today',
        'operationalStatusLabel': 'Tutup hari ini',
        'operationalStatusMessage': 'Buka lagi besok 08:00',
      };

      expect(() => OutletModel.fromJson(json), returnsNormally);

      final model = OutletModel.fromJson(json);
      expect(
        model.todaySchedule,
        isNull,
        reason: 'todaySchedule should be null for closed outlet',
      );
    });

    test(
      'normalizes todaySchedule from non-empty todayHours (open outlet)',
      () {
        final json = {
          ...baseJson(),
          'isCurrentlyOpen': true,
          'todaySchedule': [],
          'todayHours': [
            {'open': '08:00', 'close': '21:00'},
          ],
          'operationalStatus': 'open',
          'operationalStatusLabel': 'Buka',
          'operationalStatusMessage': 'Buka sampai 21:00',
        };

        final model = OutletModel.fromJson(json);
        expect(model.todaySchedule, isNotNull);
        expect(model.todaySchedule!['isOpen'], isTrue);
        expect(model.todaySchedule!['openTime'], equals('08:00'));
        expect(model.todaySchedule!['closeTime'], equals('21:00'));
      },
    );

    test(
      'todaySchedule is null when neither todaySchedule nor todayHours present',
      () {
        final json = {...baseJson(), 'operationalStatus': 'hours_not_set'};

        final model = OutletModel.fromJson(json);
        expect(model.todaySchedule, isNull);
      },
    );

    test('operationalStatus is populated from flat fields for open outlet', () {
      final json = {
        ...baseJson(),
        'isCurrentlyOpen': true,
        'todayHours': [
          {'open': '08:00', 'close': '21:00'},
        ],
        'weeklyHours': [
          {
            'day': 'monday',
            'dayLabel': 'Senin',
            'isClosed': false,
            'timeRanges': [
              {'open': '08:00', 'close': '21:00'},
            ],
          },
        ],
        'operationalStatus': 'open',
        'operationalStatusLabel': 'Buka',
        'operationalStatusMessage': 'Buka sampai 21:00',
        'canCreateOrderNow': true,
      };

      final model = OutletModel.fromJson(json);
      expect(model.operationalStatus, isNotNull);
      expect(model.operationalStatus!.operationalStatus, equals('open'));
      expect(model.operationalStatus!.todayHours, hasLength(1));
      expect(model.operationalStatus!.weeklyHours, hasLength(1));
    });

    test('does not throw for minimal nearby response shape', () {
      // Simulasi response actual dari endpoint nearby untuk outlet tutup
      final json = {
        'id': 42,
        'name': 'Laundry Bersih',
        'status': 'active',
        'isCurrentlyOpen': false,
        'isActivated': true,
        'hasActiveExposure': true,
        'isCourierEnabled': true,
        'hasFreeShipping': false,
        'hasUnconditionalFreeShipping': false,
        'distance': 1.2,
        'latitude': -6.200,
        'longitude': 106.816,
        'todaySchedule': [], // <-- trigger utama crash
        'todayHours': [],
        'weeklyHours': [],
        'operationalStatus': 'closed_today',
        'operationalStatusLabel': 'Tutup hari ini',
        'operationalStatusMessage': 'Buka lagi besok 08:00',
        'nextOpenAt': '2026-06-19T08:00:00+07:00',
        'canCreateOrderNow': false,
      };

      expect(() => OutletModel.fromJson(json), returnsNormally);
    });
  });
}
