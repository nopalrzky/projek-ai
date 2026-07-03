<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Exception;

#[Table('accounts')]
class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'outlet_id',
        'parent_id',
        'code',
        'name',
        'slug',
        'type',
        'account_role',
        'level',
        'is_system',
        'is_transactional',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'owner_id'         => 'integer',
            'outlet_id'        => 'integer',
            'parent_id'        => 'integer',
            'level'            => 'integer',
            'is_system'        => 'boolean',
            'is_transactional' => 'boolean',
            'is_active'        => 'boolean',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
            'deleted_at'       => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors & Mutators
    |--------------------------------------------------------------------------
    | Only kept for computed properties that are not simple column mappings.
    */

    /** Computed balance from loaded journal entries. */
    protected function snapshotBalance(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                $totalDebit  = $this->journalEntries->sum('debit');
                $totalCredit = $this->journalEntries->sum('credit');

                if ($this->type === 'asset') {
                    return $totalDebit - $totalCredit;
                }

                if (in_array($this->type, ['liability', 'equity'])) {
                    return $totalCredit - $totalDebit;
                }

                return 0;
            }
        );
    }

    protected function snapshotDebit(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                return $this->journalEntries->sum('debit');
            }
        );
    }

    protected function snapshotCredit(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                return $this->journalEntries->sum('credit');
            }
        );
    }

    protected function periodBalance(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                $totalDebit  = $this->journalEntries->sum('debit');
                $totalCredit = $this->journalEntries->sum('credit');

                if ($this->type === 'revenue') {
                    return $totalCredit - $totalDebit;
                }

                if ($this->type === 'expense') {
                    return $totalDebit - $totalCredit;
                }

                return 0;
            }
        );
    }

    protected function periodDebit(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                return $this->journalEntries->sum('debit');
            }
        );
    }

    protected function periodCredit(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('journalEntries')) {
                    return 0;
                }

                return $this->journalEntries->sum('credit');
            }
        );
    }

    protected function balance(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getCurrentBalance()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function journalDetails(): HasMany
    {
        return $this->hasMany(JournalDetail::class, 'account_id');
    }

    /** Alias of journalDetails for balance calculation convenience. */
    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalDetail::class, 'account_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'expense_account_id');
    }

    public function expenseSources(): HasMany
    {
        return $this->hasMany(Expense::class, 'source_account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeByOutletId(Builder $query, ?int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId);
    }

    public function scopeByOwnerId(Builder $query, int $ownerId): Builder
    {
        return $query->where('owner_id', $ownerId);
    }

    public function scopeById(Builder $query, int $id): Builder
    {
        return $query->where('id', $id);
    }

    public function scopeByAccountRole(Builder $query, string $role): Builder
    {
        return $query->where('account_role', $role);
    }

    public function scopeByAccountRoles(Builder $query, array $roles): Builder
    {
        return $query->whereIn('account_role', $roles);
    }

    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopeChildrenOf(Builder $query, int $parentId): Builder
    {
        return $query->where('parent_id', $parentId);
    }

    public function scopeSystemAccounts(Builder $query): Builder
    {
        return $query->where('is_system', true)->whereNull('outlet_id');
    }

    public function scopeOutletAccounts(Builder $query, int $outletId): Builder
    {
        return $query->where('outlet_id', $outletId)->where('is_system', false);
    }

    public function scopeByParentId(Builder $query, ?int $parentId): Builder
    {
        if (is_null($parentId)) {
            return $query->whereNull('parent_id');
        }

        return $query->where('parent_id', $parentId);
    }

    public function scopeByCode(Builder $query, string $code): Builder
    {
        return $query->where('code', $code);
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeIsTransactional(Builder $query, bool $isTransactional = true): Builder
    {
        return $query->where('is_transactional', $isTransactional);
    }

    public function scopeIsSystem(Builder $query, bool $isSystem = true): Builder
    {
        return $query->where('is_system', $isSystem);
    }

    public function scopeByLevel(Builder $query, int $level): Builder
    {
        return $query->where('level', $level);
    }

    public function scopeAssets(Builder $query): Builder
    {
        return $query->where('type', 'asset');
    }

    public function scopeExpenses(Builder $query): Builder
    {
        return $query->where('type', 'expense');
    }

    public function scopeRevenues(Builder $query): Builder
    {
        return $query->where('type', 'revenue');
    }

    public function scopeRevenueAndExpense(Builder $query): Builder
    {
        return $query->whereIn('type', ['revenue', 'expense']);
    }

    public function scopeEquities(Builder $query): Builder
    {
        return $query->where('type', 'equity');
    }

    public function scopeEquity(Builder $query): Builder
    {
        return $query->where('type', 'equity');
    }

    public function scopeLiabilities(Builder $query): Builder
    {
        return $query->where('type', 'liability');
    }

    public function scopeBySlug(Builder $query, string $slug): Builder
    {
        return $query->where('slug', $slug);
    }

    public function scopeBySubtype(Builder $query, string $subtype): Builder
    {
        return $query->where('subtype', $subtype);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->whereNested(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%");
        });
    }

    public function scopeOrderByTypeAndCode(Builder $query): Builder
    {
        return $query
            ->orderByRaw("
                CASE type
                    WHEN 'asset' THEN 1
                    WHEN 'liability' THEN 2
                    WHEN 'equity' THEN 3
                    WHEN 'revenue' THEN 4
                    WHEN 'expense' THEN 5
                    ELSE 6
                END
            ")
            ->orderBy('code', 'asc');
    }

    public function scopeWithTransactionsUntil(Builder $query, int $outletId, string $date): Builder
    {
        return $query->with([
            'journalEntries' => function ($journalDetailQuery) use ($outletId, $date) {
                $journalDetailQuery
                    ->select('id', 'journal_entry_id', 'account_id', 'debit', 'credit')
                    ->whereHas('journalEntry', function ($journalEntryQuery) use ($outletId, $date) {
                        $journalEntryQuery
                            ->where('outlet_id', $outletId)
                            ->whereDate('date', '<=', $date);
                    });
            },
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isOutletAccount(): bool
    {
        return !is_null($this->outlet_id) && !$this->is_system;
    }

    public function isSystemAccount(): bool
    {
        return $this->is_system && is_null($this->outlet_id);
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function canBeDeleted(): bool
    {
        if ($this->hasChildren()) {
            return false;
        }

        if ($this->is_system) {
            return false;
        }

        return true;
    }

    public function canBeModified(): bool
    {
        return !$this->is_system;
    }

    public function calculateBalance(?string $startDate = null, ?string $endDate = null): float
    {
        $query = $this->journalEntries();

        if ($startDate && $endDate) {
            $query->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            });
        }

        $totalDebit  = $query->sum('debit');
        $totalCredit = $query->sum('credit');

        if (in_array($this->type, ['asset', 'expense'])) {
            return $totalDebit - $totalCredit;
        }

        return $totalCredit - $totalDebit;
    }

    public function getCurrentBalance(): float
    {
        return $this->calculateBalance();
    }

    /** Returns breadcrumb: "ASET > Aset Lancar > Kas" */
    public function getFullPath(): string
    {
        $path    = [$this->name];
        $current = $this;

        while ($current->parent) {
            $current = $current->parent;
            array_unshift($path, $current->name);
        }

        return implode(' > ', $path);
    }

    public function getDepth(): int
    {
        return $this->level;
    }

    public function isChildOf(Account $account): bool
    {
        $current = $this;

        while ($current->parent_id) {
            if ($current->parent_id === $account->id) {
                return true;
            }
            $current = $current->parent;
            if (!$current) {
                break;
            }
        }

        return false;
    }

    public function getDescendants(): array
    {
        $descendants = [];

        foreach ($this->children as $child) {
            $descendants[] = $child;
            $descendants   = array_merge($descendants, $child->getDescendants());
        }

        return $descendants;
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'asset'     => 'Aset',
            'liability' => 'Kewajiban',
            'equity'    => 'Modal',
            'revenue'   => 'Pendapatan',
            'expense'   => 'Beban',
            default     => ucfirst($this->type),
        };
    }

    public function getTypeVariant(): string
    {
        return match ($this->type) {
            'asset'     => 'primary',
            'liability' => 'danger',
            'equity'    => 'warning',
            'revenue'   => 'success',
            'expense'   => 'info',
            default     => 'secondary',
        };
    }

    public function getSubtypeLabel(): string
    {
        return match ($this->subtype) {
            'operating_revenue' => 'Pendapatan Operasional',
            'other_revenue'     => 'Pendapatan Lain-lain',
            'cost_of_revenue'   => 'Harga Pokok Penjualan',
            'operating_expense' => 'Beban Operasional',
            'other_expense'     => 'Beban Lain-lain',
            default             => ucfirst($this->subtype ?? '-'),
        };
    }

    public function getRoleLabel(): string
    {
        return match ($this->account_role) {
            'cash'       => 'Kas',
            'receivable' => 'Piutang',
            'loan'       => 'Pinjaman',
            'fine'       => 'Denda',
            'revenue'    => 'Pendapatan',
            'expense'    => 'Beban',
            default      => ucfirst($this->account_role ?? 'Umum'),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Static Helpers
    |--------------------------------------------------------------------------
    */

    /** @throws Exception */
    public static function generateNextCode(int $ownerId, ?int $parentId = null): string
    {
        try {
            if (is_null($parentId)) {
                return self::generateLevel1Code($ownerId);
            }

            $parent = self::byOwnerId($ownerId)->byId($parentId)->firstOrFail();

            if ($parent->level >= 3) {
                throw new Exception("Maximum account level is 3. Cannot create child account under level {$parent->level}.");
            }

            if ($parent->level === 1) {
                return self::generateLevel2Code($ownerId, $parent);
            }

            if ($parent->level === 2) {
                return self::generateLevel3Code($ownerId, $parent);
            }

            throw new Exception("Invalid parent level: {$parent->level}");
        } catch (Exception $e) {
            throw new Exception("Failed to generate account code: {$e->getMessage()}");
        }
    }

    private static function generateLevel1Code(int $ownerId): string
    {
        $maxAccount = self::byOwnerId($ownerId)->root()->orderBy('code', 'desc')->first();

        if (!$maxAccount) {
            return '1-00-0000';
        }

        $codeParts  = explode('-', $maxAccount->code);
        $lastNumber = (int) $codeParts[0];

        return ($lastNumber + 1) . '-00-0000';
    }

    private static function generateLevel2Code(int $ownerId, Account $parent): string
    {
        $lastChild = self::byOwnerId($ownerId)->childrenOf($parent->id)->orderBy('code', 'desc')->first();

        $parentParts = explode('-', $parent->code);
        $parentFirst = $parentParts[0];

        if (!$lastChild) {
            return $parentFirst . '-01-0000';
        }

        $childParts  = explode('-', $lastChild->code);
        $lastMiddle  = (int) $childParts[1];
        $nextMiddle  = str_pad((string) ($lastMiddle + 1), 2, '0', STR_PAD_LEFT);

        return $parentFirst . '-' . $nextMiddle . '-0000';
    }

    private static function generateLevel3Code(int $ownerId, Account $parent): string
    {
        $lastChild = self::byOwnerId($ownerId)->childrenOf($parent->id)->orderBy('code', 'desc')->first();

        $parentParts  = explode('-', $parent->code);
        $parentPrefix = $parentParts[0] . '-' . $parentParts[1];

        if (!$lastChild) {
            return $parentPrefix . '-0001';
        }

        $childParts = explode('-', $lastChild->code);
        $nextSuffix = str_pad((string) ((int) $childParts[2] + 1), 4, '0', STR_PAD_LEFT);

        return $parentPrefix . '-' . $nextSuffix;
    }

    /** @throws Exception */
    public static function generateOutletAccountCode(int $ownerId, int $outletId, ?int $parentId = null): string
    {
        if (is_null($parentId)) {
            return self::generateOutletLevel1Code($ownerId, $outletId);
        }

        $parent = self::byOwnerId($ownerId)->byOutletId($outletId)->byId($parentId)->firstOrFail();

        if ($parent->level >= 3) {
            throw new Exception("Maximum account level is 3.");
        }

        if ($parent->level === 1) {
            return self::generateOutletLevel2Code($ownerId, $outletId, $parent);
        }

        if ($parent->level === 2) {
            return self::generateOutletLevel3Code($ownerId, $outletId, $parent);
        }

        throw new Exception("Invalid parent level: {$parent->level}");
    }

    private static function generateOutletLevel1Code(int $ownerId, int $outletId): string
    {
        $maxAccount = self::byOwnerId($ownerId)->byOutletId($outletId)->root()->orderBy('code', 'desc')->first();

        if (!$maxAccount) {
            return 'O' . $outletId . '-1-00-0000';
        }

        $pattern = '/^O' . $outletId . '-(\\d+)-00-0000$/';
        $nextNumber = preg_match($pattern, $maxAccount->code, $matches) ? (int) $matches[1] + 1 : 1;

        return 'O' . $outletId . '-' . $nextNumber . '-00-0000';
    }

    private static function generateOutletLevel2Code(int $ownerId, int $outletId, Account $parent): string
    {
        $lastChild = self::byOwnerId($ownerId)->byOutletId($outletId)->childrenOf($parent->id)->orderBy('code', 'desc')->first();
        $pattern   = '/^O' . $outletId . '-(\\d+)-(\\d+)-0000$/';

        if (!$lastChild) {
            preg_match('/^O' . $outletId . '-(\\d+)-00-0000$/', $parent->code, $matches);
            return 'O' . $outletId . '-' . $matches[1] . '-01-0000';
        }

        if (preg_match($pattern, $lastChild->code, $matches)) {
            $nextMiddle = str_pad((string) ((int) $matches[2] + 1), 2, '0', STR_PAD_LEFT);
            return 'O' . $outletId . '-' . $matches[1] . '-' . $nextMiddle . '-0000';
        }

        throw new Exception("Invalid parent code format");
    }

    private static function generateOutletLevel3Code(int $ownerId, int $outletId, Account $parent): string
    {
        $lastChild = self::byOwnerId($ownerId)->byOutletId($outletId)->childrenOf($parent->id)->orderBy('code', 'desc')->first();
        $pattern   = '/^O' . $outletId . '-(\\d+)-(\\d+)-(\\d+)$/';

        if (!$lastChild) {
            preg_match('/^O' . $outletId . '-(\\d+)-(\\d+)-0000$/', $parent->code, $matches);
            return 'O' . $outletId . '-' . $matches[1] . '-' . $matches[2] . '-0001';
        }

        if (preg_match($pattern, $lastChild->code, $matches)) {
            $nextSuffix = str_pad((string) ((int) $matches[3] + 1), 4, '0', STR_PAD_LEFT);
            return 'O' . $outletId . '-' . $matches[1] . '-' . $matches[2] . '-' . $nextSuffix;
        }

        throw new Exception("Invalid parent code format");
    }

    public static function validateCodeFormat(string $code, int $level): bool
    {
        $pattern = '/^\\d{1,2}-\\d{2}-\\d{4}$/';

        if (!preg_match($pattern, $code)) {
            return false;
        }

        $parts = explode('-', $code);

        if (count($parts) !== 3) {
            return false;
        }

        [, $middle, $last] = $parts;

        return match ($level) {
            1       => $middle === '00' && $last === '0000',
            2       => $last === '0000' && $middle !== '00',
            3       => $last !== '0000' && $middle !== '00',
            default => false,
        };
    }
}
