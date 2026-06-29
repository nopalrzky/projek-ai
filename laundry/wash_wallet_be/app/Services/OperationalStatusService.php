<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\OperationalDay;
use Carbon\Carbon;

class OperationalStatusService
{
    public function resolve(Outlet $outlet): array
    {
        $timezone = $outlet->timezone ?? 'Asia/Jakarta';
        $now = Carbon::now($timezone);
        $todayStr = strtolower($now->format('l'));
        $currentTime = $now->format('H:i:s');

        $result = [
            'timezone' => $timezone,
            'isOpenNow' => false,
            'operationalStatus' => 'hours_not_set',
            'operationalStatusLabel' => 'Jam operasional belum tersedia',
            'operationalStatusMessage' => 'Outlet belum dapat menerima order saat ini.',
            'todayHours' => [],
            'weeklyHours' => [],
            'nextOpenAt' => null,
            'nextCloseAt' => null,
            'canCreateOrderNow' => false,
            'orderDisabledReason' => 'Jam operasional belum tersedia. Outlet belum dapat menerima order saat ini.',
        ];

        if (!$outlet->relationLoaded('operationalDays')) {
            $outlet->load('operationalDays');
        }

        $opDays = $outlet->operationalDays;
        
        if ($opDays->isEmpty()) {
            return $result;
        }

        // Build weeklyHours
        $daysOrder = array_keys(OperationalDay::DAYS_OF_WEEK);
        $opDaysMap = $opDays->keyBy('day_of_week');

        $weeklyHours = [];
        foreach ($daysOrder as $day) {
            $dayModel = $opDaysMap->get($day);
            $timeRanges = [];
            $isClosed = true;

            if ($dayModel && $dayModel->is_open && $dayModel->open_time && $dayModel->close_time) {
                $isClosed = false;
                $timeRanges[] = [
                    'open' => Carbon::parse($dayModel->open_time)->format('H:i'),
                    'close' => Carbon::parse($dayModel->close_time)->format('H:i'),
                ];
            }

            $weeklyHours[] = [
                'day' => $day,
                'dayLabel' => OperationalDay::DAYS_OF_WEEK[$day] ?? $day,
                'isClosed' => $isClosed,
                'timeRanges' => $timeRanges,
            ];
        }
        $result['weeklyHours'] = $weeklyHours;

        $todayModel = $opDaysMap->get($todayStr);
        if (!$todayModel || !$todayModel->is_open || !$todayModel->open_time || !$todayModel->close_time) {
            // Closed today
            $result['operationalStatus'] = 'closed_today';
            $result['operationalStatusLabel'] = 'Tutup hari ini';
            
            $nextOpen = $this->findNextOpen($opDaysMap, $now);
            if ($nextOpen) {
                $result['nextOpenAt'] = $nextOpen['datetime']->toIso8601String();
                $result['operationalStatusMessage'] = "Buka lagi {$nextOpen['label']} {$nextOpen['time']}";
            } else {
                $result['operationalStatusMessage'] = 'Tutup sementara waktu';
            }
            
            $result['orderDisabledReason'] = 'Outlet sedang tutup. Kamu bisa membuat order saat outlet buka kembali.';
            return $result;
        }

        // Open today, check time
        $result['todayHours'][] = [
            'open' => Carbon::parse($todayModel->open_time)->format('H:i'),
            'close' => Carbon::parse($todayModel->close_time)->format('H:i'),
        ];

        $isOpen = false;
        $isPast = false;
        $isBefore = false;

        $openTimeStr = $todayModel->open_time;
        $closeTimeStr = $todayModel->close_time;

        if ($closeTimeStr < $openTimeStr) {
            // crosses midnight
            if ($currentTime >= $openTimeStr || $currentTime <= $closeTimeStr) {
                $isOpen = true;
            } else if ($currentTime < $openTimeStr) {
                $isBefore = true;
            }
        } else {
            if ($currentTime >= $openTimeStr && $currentTime <= $closeTimeStr) {
                $isOpen = true;
            } else if ($currentTime > $closeTimeStr) {
                $isPast = true;
            } else if ($currentTime < $openTimeStr) {
                $isBefore = true;
            }
        }

        if ($isOpen) {
            $result['isOpenNow'] = true;
            $result['canCreateOrderNow'] = true;
            $result['operationalStatus'] = 'open';
            $result['operationalStatusLabel'] = 'Buka';
            
            $closeCarbon = Carbon::parse($todayModel->close_time, $timezone);
            if ($closeTimeStr < $openTimeStr && $currentTime >= $openTimeStr) {
                $closeCarbon->addDay();
            }
            $result['nextCloseAt'] = $closeCarbon->toIso8601String();
            $result['operationalStatusMessage'] = 'Buka sampai ' . $closeCarbon->format('H:i');
            $result['orderDisabledReason'] = null;
        } else if ($isBefore) {
            $result['operationalStatus'] = 'temporary_closed';
            $result['operationalStatusLabel'] = 'Tutup sementara';
            $nextOpenCarbon = Carbon::parse($todayModel->open_time, $timezone);
            $result['nextOpenAt'] = $nextOpenCarbon->toIso8601String();
            $result['operationalStatusMessage'] = 'Buka lagi hari ini ' . $nextOpenCarbon->format('H:i');
            $result['orderDisabledReason'] = 'Outlet sedang istirahat. Kamu bisa membuat order saat outlet buka kembali pukul ' . $nextOpenCarbon->format('H:i') . '.';
        } else {
            // past close time
            $result['operationalStatus'] = 'closed';
            $result['operationalStatusLabel'] = 'Tutup';
            $nextOpen = $this->findNextOpen($opDaysMap, $now);
            if ($nextOpen) {
                $result['nextOpenAt'] = $nextOpen['datetime']->toIso8601String();
                $result['operationalStatusMessage'] = "Buka lagi {$nextOpen['label']} {$nextOpen['time']}";
            } else {
                $result['operationalStatusMessage'] = 'Tutup sementara waktu';
            }
            $result['orderDisabledReason'] = 'Outlet sedang tutup. Kamu bisa membuat order saat outlet buka kembali.';
        }

        return $result;
    }

    private function findNextOpen($opDaysMap, Carbon $now): ?array
    {
        $timezone = $now->getTimezone();
        // check up to 7 days
        for ($i = 1; $i <= 7; $i++) {
            $checkDate = clone $now;
            $checkDate->addDays($i);
            $dayStr = strtolower($checkDate->format('l'));
            $dayModel = $opDaysMap->get($dayStr);
            if ($dayModel && $dayModel->is_open && $dayModel->open_time) {
                $openDt = Carbon::parse($checkDate->format('Y-m-d') . ' ' . $dayModel->open_time, $timezone);
                
                $label = '';
                if ($i === 1) {
                    $label = 'besok';
                } else {
                    $label = OperationalDay::DAYS_OF_WEEK[$dayStr] ?? $dayStr;
                }

                return [
                    'datetime' => $openDt,
                    'label' => $label,
                    'time' => $openDt->format('H:i'),
                ];
            }
        }
        return null;
    }
}
