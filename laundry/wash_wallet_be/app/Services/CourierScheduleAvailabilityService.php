<?php

namespace App\Services;

use App\Models\CourierSchedule;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Validation\ValidationException;

class CourierScheduleAvailabilityService
{
    public function resolve(CourierSchedule $schedule, ?string $targetDate = null, ?CarbonInterface $now = null): array
    {
        if (!$schedule->is_active) {
            return $this->unavailable('inactive', 'Tidak tersedia', 'Jadwal ini sedang tidak aktif.');
        }

        if (!$targetDate) {
            return $this->available();
        }

        $timezone = $this->timezone($schedule);
        $currentTime = ($now ? Carbon::instance($now) : Carbon::now($timezone))->setTimezone($timezone);
        $date = Carbon::parse($targetDate, $timezone)->startOfDay();

        if (!$date->isSameDay($currentTime)) {
            return $this->available();
        }

        $start = Carbon::parse($date->format('Y-m-d') . ' ' . $schedule->start_time->format('H:i:s'), $timezone);
        $end = Carbon::parse($date->format('Y-m-d') . ' ' . $schedule->end_time->format('H:i:s'), $timezone);

        if ($currentTime->lt($start)) {
            return $this->available();
        }

        if ($currentTime->lt($end)) {
            return $this->unavailable(
                'in_progress',
                'Sedang berlangsung',
                'Slot jadwal ini sedang berlangsung dan tidak bisa dipilih.'
            );
        }

        return $this->unavailable(
            'past',
            'Sudah lewat',
            'Slot jadwal ini sudah lewat dan tidak bisa dipilih.'
        );
    }

    public function ensureBookable(CourierSchedule $schedule, string $targetDate, string $type, string $field): void
    {
        if ($schedule->type !== $type) {
            throw ValidationException::withMessages([
                $field => 'Jadwal kurir tidak sesuai dengan tipe layanan yang dipilih.',
            ]);
        }

        $timezone = $this->timezone($schedule);
        $date = Carbon::parse($targetDate, $timezone);
        $dayOfWeek = strtolower($date->format('l'));

        if ($schedule->day_of_week !== $dayOfWeek) {
            throw ValidationException::withMessages([
                $field => 'Jadwal kurir tidak tersedia untuk tanggal yang dipilih.',
            ]);
        }

        $availability = $this->resolve($schedule, $targetDate);

        if (!$availability['isBookable']) {
            throw ValidationException::withMessages([
                $field => $availability['unavailableReason'] ?? 'Jadwal kurir tidak tersedia.',
            ]);
        }
    }

    private function timezone(CourierSchedule $schedule): string
    {
        if (!$schedule->relationLoaded('outlet')) {
            $schedule->load('outlet');
        }

        return $schedule->outlet?->timezone ?? 'Asia/Jakarta';
    }

    public function getDefaultDate(int $outletId, string $type, ?CarbonInterface $now = null): array
    {
        $outlet = \App\Models\Outlet::find($outletId);
        $timezone = $outlet?->timezone ?? 'Asia/Jakarta';
        $currentTime = ($now ? Carbon::instance($now) : Carbon::now($timezone))->setTimezone($timezone);
        $currentDate = $currentTime->clone()->startOfDay();

        for ($offset = 0; $offset <= 30; $offset++) {
            $candidateDate = $currentDate->clone()->addDays($offset);
            $dayOfWeek = strtolower($candidateDate->format('l'));

            $schedules = CourierSchedule::where('outlet_id', $outletId)
                ->where('type', $type)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_active', true)
                ->get();

            if ($schedules->isEmpty()) {
                continue;
            }

            if ($offset === 0) {
                // Hari ini: cek apakah ada slot yang belum mulai
                $hasAvailableSlot = false;
                foreach ($schedules as $schedule) {
                    $start = Carbon::parse($candidateDate->format('Y-m-d') . ' ' . $schedule->start_time->format('H:i:s'), $timezone);
                    if ($currentTime->lt($start)) {
                        $hasAvailableSlot = true;
                        break;
                    }
                }
                
                if ($hasAvailableSlot) {
                    Carbon::setLocale('id');
                    return [
                        'defaultDate' => $candidateDate->format('Y-m-d'),
                        'defaultDayLabel' => $candidateDate->translatedFormat('l, j F Y'),
                        'reason' => 'today',
                    ];
                }
            } else {
                // Hari berikutnya
                Carbon::setLocale('id');
                return [
                    'defaultDate' => $candidateDate->format('Y-m-d'),
                    'defaultDayLabel' => $candidateDate->translatedFormat('l, j F Y'),
                    'reason' => 'next_available_day',
                ];
            }
        }

        return [
            'defaultDate' => null,
            'defaultDayLabel' => null,
            'reason' => 'no_schedule_available',
        ];
    }

    private function available(): array
    {
        return [
            'isBookable' => true,
            'availabilityStatus' => 'available',
            'availabilityLabel' => 'Tersedia',
            'unavailableReason' => null,
        ];
    }

    private function unavailable(string $status, string $label, string $reason): array
    {
        return [
            'isBookable' => false,
            'availabilityStatus' => $status,
            'availabilityLabel' => $label,
            'unavailableReason' => $reason,
        ];
    }
}
