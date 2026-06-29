<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\OperationalDay\StoreOperationalDayRequest;
use App\Http\Requests\OperationalDay\UpdateOperationalDayRequest;
use App\Models\OperationalDay;

#[Middleware('auth')]
class OperationalDayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOperationalDayRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(OperationalDay $operationalDay)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OperationalDay $operationalDay)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOperationalDayRequest $request, OperationalDay $operationalDay)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OperationalDay $operationalDay)
    {
        //
    }
}
