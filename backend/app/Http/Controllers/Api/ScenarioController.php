<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scenario;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{
    public function index()
    {
        return Scenario::withCount('optimizationResults')->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:draft,active,archived',
        ]);

        $scenario = Scenario::create($data);

        return response()->json($scenario, 201);
    }

    public function show(Scenario $scenario)
    {
        return $scenario->load(['optimizationResults.station', 'optimizationResults.simulationResult']);
    }

    public function update(Request $request, Scenario $scenario)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,active,archived',
        ]);

        $scenario->update($data);

        return $scenario;
    }

    public function destroy(Scenario $scenario)
    {
        $scenario->delete();

        return response()->json(null, 204);
    }

    /**
     * Side-by-side comparison of multiple scenarios' key indicators.
     * GET /api/scenarios/compare?ids=1,2,3
     */
    public function compare(Request $request)
    {
        $ids = array_filter(explode(',', $request->query('ids', '')));

        $scenarios = Scenario::whereIn('id', $ids)
            ->with('optimizationResults.simulationResult')
            ->get()
            ->map(function (Scenario $scenario) {
                $results = $scenario->optimizationResults;

                return [
                    'id' => $scenario->id,
                    'name' => $scenario->name,
                    'status' => $scenario->status,
                    'station_count' => $results->count(),
                    'total_capacity_kw' => round($results->sum('capacity_kw'), 2),
                    'total_operational_cost' => round($results->sum('operational_cost'), 2),
                    'avg_demand_coverage' => $results->count()
                        ? round($results->avg('demand_coverage'), 4)
                        : null,
                    'total_estimated_emissions_kg' => round($results->sum('estimated_emissions_kg'), 2),
                    'feasible_share' => $results->count()
                        ? round($results->filter(fn ($r) => $r->simulationResult?->feasibility_status === 'feasible')->count() / $results->count(), 2)
                        : null,
                ];
            });

        return response()->json($scenarios);
    }
}
