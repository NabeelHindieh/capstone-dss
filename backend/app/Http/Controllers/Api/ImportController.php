<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChargingStation;
use App\Models\DatasetImport;
use App\Models\OptimizationResult;
use App\Models\Scenario;
use App\Models\SimulationResult;
use App\Services\DatasetImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;

class ImportController extends Controller
{

    /** DELETE /api/import/{type} — wipes all rows for that dataset type */
public function clear(string $type)
{
    $validTypes = ['candidate_pois', 'existing_chargers', 'sockets', 'traffic_demand'];

    if (! in_array($type, $validTypes, true)) {
        return response()->json(['message' => 'Unknown dataset type'], 422);
    }

    $deleted = $this->importer->clearDataset($type);

    return response()->json(['deleted' => $deleted]);
}
    public function __construct(private DatasetImportService $importer)
    {
    }

    /**
     * Recent import runs across all dataset types, newest first — powers the
     * "Data Import" page's validation history table.
     * GET /api/imports
     */
    public function history()
    {
        return \App\Models\DatasetImport::latest('imported_at')->limit(50)->get();
    }

    /** POST /api/import/candidate-pois (multipart: file) */
    public function candidatePois(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $log = $this->importer->importCandidatePois(
            $request->file('file')->getRealPath(),
            $request->file('file')->getClientOriginalName()
        );

        return response()->json($log, 201);
    }

    /** POST /api/import/existing-chargers (multipart: file) */
    public function existingChargers(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $log = $this->importer->importExistingChargers(
            $request->file('file')->getRealPath(),
            $request->file('file')->getClientOriginalName()
        );

        return response()->json($log, 201);
    }

    /** POST /api/import/sockets (multipart: file) — import existing_chargers first */
    public function sockets(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $log = $this->importer->importSockets(
            $request->file('file')->getRealPath(),
            $request->file('file')->getClientOriginalName()
        );

        return response()->json($log, 201);
    }

    /** POST /api/import/traffic-demand (multipart: file) */
    public function trafficDemand(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        $log = $this->importer->importTrafficDemand(
            $request->file('file')->getRealPath(),
            $request->file('file')->getClientOriginalName()
        );

        return response()->json($log, 201);
    }

    /**
     * Imports the Industrial Engineering optimization results CSV for a scenario.
     * Expected columns: external_id,name,lat,lon,capacity_kw,operational_cost,demand_coverage,estimated_emissions_kg
     * POST /api/import/optimization-results  (multipart: file, scenario_id)
     */
    public function optimizationResults(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
            'scenario_id' => 'required|exists:scenarios,id',
        ]);

        $scenario = Scenario::findOrFail($request->input('scenario_id'));
        $csv = Reader::createFromPath($request->file('file')->getRealPath());
        $csv->setHeaderOffset(0);

        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, $scenario, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;
                $rowErrors = $this->validateOptimizationRow($record);

                if ($rowErrors) {
                    $errors[] = ['row' => $offset + 2, 'issues' => $rowErrors];
                    continue;
                }

                $station = ChargingStation::updateOrCreate(
                    ['scenario_id' => $scenario->id, 'external_id' => $record['external_id']],
                    [
                        'source_type' => 'optimized',
                        'name' => $record['name'],
                        'lat' => $record['lat'],
                        'lon' => $record['lon'],
                        'capacity_kw' => $record['capacity_kw'],
                    ]
                );

                OptimizationResult::updateOrCreate(
                    ['scenario_id' => $scenario->id, 'charging_station_id' => $station->id],
                    [
                        'capacity_kw' => $record['capacity_kw'],
                        'operational_cost' => $record['operational_cost'] ?? null,
                        'demand_coverage' => $record['demand_coverage'] ?? null,
                        'estimated_emissions_kg' => $record['estimated_emissions_kg'] ?? null,
                    ]
                );

                $valid++;
            }
        });

        return $this->logImport('optimization_results', $request->file('file')->getClientOriginalName(), $total, $valid, $errors);
    }

    /**
     * Imports the Electrical/Electronics Engineering simulation results CSV.
     * Expected columns: external_id,pv_generation_kwh,battery_utilization_pct,
     *                    charging_demand_kwh,energy_efficiency_pct,power_balance_kw,feasibility_status
     * POST /api/import/simulation-results (multipart: file, scenario_id)
     */
    public function simulationResults(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
            'scenario_id' => 'required|exists:scenarios,id',
        ]);

        $csv = Reader::createFromPath($request->file('file')->getRealPath());
        $csv->setHeaderOffset(0);

        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, $request, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;

                $optimizationResult = OptimizationResult::whereHas('station', function ($q) use ($record, $request) {
                    $q->where('external_id', $record['external_id'] ?? null)
                        ->where('scenario_id', $request->input('scenario_id'));
                })->first();

                if (! $optimizationResult) {
                    $errors[] = ['row' => $offset + 2, 'issues' => ['No matching optimization result for external_id']];
                    continue;
                }

                if (! in_array($record['feasibility_status'] ?? null, ['feasible', 'marginal', 'infeasible'], true)) {
                    $errors[] = ['row' => $offset + 2, 'issues' => ['feasibility_status must be feasible, marginal, or infeasible']];
                    continue;
                }

                SimulationResult::updateOrCreate(
                    ['optimization_result_id' => $optimizationResult->id],
                    [
                        'pv_generation_kwh' => $record['pv_generation_kwh'] ?? null,
                        'battery_utilization_pct' => $record['battery_utilization_pct'] ?? null,
                        'charging_demand_kwh' => $record['charging_demand_kwh'] ?? null,
                        'energy_efficiency_pct' => $record['energy_efficiency_pct'] ?? null,
                        'power_balance_kw' => $record['power_balance_kw'] ?? null,
                        'feasibility_status' => $record['feasibility_status'],
                    ]
                );

                $valid++;
            }
        });

        return $this->logImport('simulation_results', $request->file('file')->getClientOriginalName(), $total, $valid, $errors);
    }

    private function validateOptimizationRow(array $record): array
    {
        $issues = [];

        foreach (['external_id', 'name', 'lat', 'lon', 'capacity_kw'] as $field) {
            if (! isset($record[$field]) || $record[$field] === '') {
                $issues[] = "Missing required field: {$field}";
            }
        }

        if (isset($record['lat']) && ! is_numeric($record['lat'])) {
            $issues[] = 'lat is not numeric';
        } elseif (isset($record['lat']) && ($record['lat'] < 39 || $record['lat'] > 43)) {
            $issues[] = 'lat outside plausible Istanbul range';
        }

        if (isset($record['lon']) && ! is_numeric($record['lon'])) {
            $issues[] = 'lon is not numeric';
        } elseif (isset($record['lon']) && ($record['lon'] < 25 || $record['lon'] > 32)) {
            $issues[] = 'lon outside plausible Istanbul range';
        }

        return $issues;
    }

    private function logImport(string $type, ?string $filename, int $total, int $valid, array $errors)
    {
        $log = DatasetImport::create([
            'dataset_type' => $type,
            'original_filename' => $filename,
            'total_rows' => $total,
            'valid_rows' => $valid,
            'invalid_rows' => $total - $valid,
            'errors' => $errors,
            'imported_at' => now(),
        ]);

        return response()->json($log, 201);
    }
}
