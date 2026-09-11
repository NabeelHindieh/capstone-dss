<?php

namespace App\Console\Commands;

use App\Services\DatasetImportService;
use Illuminate\Console\Command;

/**
 * Loads the four raw project datasets that live in storage/app/seed_data into
 * the database. This is the "candidate/existing/demand" base layer the map
 * renders even before any optimization or simulation results exist.
 *
 * Usage: php artisan import:base-datasets
 */
class ImportBaseDatasets extends Command
{
    protected $signature = 'import:base-datasets';

    protected $description = 'Import candidate POIs, existing chargers, sockets, and traffic demand CSVs';

    public function handle(DatasetImportService $importer): int
    {
        $seedPath = storage_path('app/seed_data');

        $log = $importer->importCandidatePois("{$seedPath}/candidate_pois.csv", 'candidate_pois.csv');
        $this->line("candidate_pois: {$log->valid_rows}/{$log->total_rows} imported");

        $log = $importer->importExistingChargers("{$seedPath}/existing_chargers_clean.csv", 'existing_chargers_clean.csv');
        $this->line("existing_chargers: {$log->valid_rows}/{$log->total_rows} imported");

        $log = $importer->importSockets("{$seedPath}/existing_sockets.csv", 'existing_sockets.csv');
        $this->line("sockets: {$log->valid_rows}/{$log->total_rows} imported");

        $log = $importer->importTrafficDemand("{$seedPath}/traffic_demand.csv", 'traffic_demand.csv');
        $this->line("traffic_demand: {$log->valid_rows}/{$log->total_rows} imported");

        $this->info('Base datasets imported.');

        return self::SUCCESS;
    }
}
