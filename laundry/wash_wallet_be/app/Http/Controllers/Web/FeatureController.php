<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\FeatureService;
use Inertia\Inertia;
use Inertia\Response;

class FeatureController extends Controller
{
    public function __construct(protected readonly FeatureService $featureService) {}

    public function operationalManagement(): Response
    {
        return Inertia::render('Features/OperationalManagement');
    }

    public function coinSystem(): Response
    {
        return Inertia::render('Features/CoinSystem');
    }

    public function affiliateProgram(): Response
    {
        return Inertia::render('Features/AffiliateProgram');
    }

    public function financialAccounting(): Response
    {
        return Inertia::render('Features/FinancialAccounting');
    }

    public function hrPayroll(): Response
    {
        return Inertia::render('Features/HrPayroll');
    }

    public function membership(): Response
    {
        return Inertia::render('Features/Membership');
    }
}
