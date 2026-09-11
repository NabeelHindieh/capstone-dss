<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChargingStation;
use App\Models\DemandPoint;
use Illuminate\Http\Request;

class MapController extends Controller
{
    /**
     * Returns layers for the Leaflet map: existing chargers, candidate POIs,
     * and (if a scenario is given) the optimized stations for that scenario.
     * GET /api/map/layers?scenario_id=1&category=avm&bounds=south,west,north,east
     */
    public function layers(Request $request)
    {
        $query = ChargingStation::query()->select([
            'id', 'scenario_id', 'source_type', 'name', 'category', 'lat', 'lon', 'capacity_kw', 'socket_count',
        ]);

        if ($request->filled('source_type')) {
    $query->where('source_type', $request->query('source_type'));
} elseif ($request->filled('scenario_id')) {
    $query->where(function ($q) use ($request) {
        $q->where('scenario_id', $request->query('scenario_id'))
            ->orWhereIn('source_type', ['existing', 'candidate']);
    });
} else {
    $query->whereIn('source_type', ['existing', 'candidate']);
}

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('bounds')) {
            [$south, $west, $north, $east] = explode(',', $request->query('bounds'));
            $query->whereBetween('lat', [$south, $north])
                ->whereBetween('lon', [$west, $east]);
        }

        return $query->limit(5000)->get();
    }

    /**
     * Demand heat-map points (from the traffic density dataset).
     * GET /api/map/demand
     */
    public function demand(Request $request)
    {
        $query = DemandPoint::query()->select(['id', 'lat', 'lon', 'demand_score', 'mean_vehicles_per_hour']);

        if ($request->filled('min_score')) {
            $query->where('demand_score', '>=', $request->query('min_score'));
        }

        return $query->limit(5000)->get();
    }
}
