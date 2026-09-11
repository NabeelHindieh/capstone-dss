<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChargingStation;
use App\Models\DatasetImport;
use App\Models\DemandPoint;
use App\Models\Scenario;

class DashboardController extends Controller
{
    /**
     * Top-level summary numbers shown on the dashboard landing page.
     * GET /api/dashboard/summary
     */
    public function summary()
    {
        return [
            'existing_stations' => ChargingStation::existing()->count(),
            'candidate_sites' => ChargingStation::candidate()->count(),
            'optimized_stations' => ChargingStation::optimized()->count(),
            'scenarios' => Scenario::count(),
            'demand_points' => DemandPoint::count(),
            'avg_demand_score' => round((float) DemandPoint::avg('demand_score'), 4),
            'last_import' => DatasetImport::select(['id', 'dataset_type', 'original_filename', 'valid_rows', 'invalid_rows', 'imported_at'])
    ->latest('id')
    ->first(),
        ];
    }
}
