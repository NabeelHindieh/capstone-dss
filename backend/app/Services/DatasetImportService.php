<?php

namespace App\Services;

use App\Models\ChargingStation;
use App\Models\DatasetImport;
use App\Models\DemandPoint;
use App\Models\Socket;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;

/**
 * Parses and stores the base-layer datasets (candidate POIs, existing
 * chargers, sockets, traffic demand). Used both by `php artisan
 * import:base-datasets` and by the web upload endpoints in
 * ImportController, so validation rules only live in one place.
 */
class DatasetImportService
{

    public function clearDataset(string $type): int
{
    return match ($type) {
        'candidate_pois' => ChargingStation::where('source_type', 'candidate')->delete(),
        'existing_chargers' => DB::transaction(function () {
            $ids = ChargingStation::where('source_type', 'existing')->pluck('id');
            Socket::whereIn('charging_station_id', $ids)->delete();
            return ChargingStation::where('source_type', 'existing')->delete();
        }),
        'sockets' => DB::transaction(function () {
            $count = Socket::query()->delete();
            DB::statement('UPDATE charging_stations SET socket_count = 0 WHERE source_type = "existing"');
            return $count;
        }),
        'traffic_demand' => DemandPoint::query()->delete(),
        default => throw new \InvalidArgumentException("Unknown dataset type: {$type}"),
    };
}

    public function importCandidatePois(string $path, string $originalFilename): DatasetImport
    {
        $csv = Reader::createFromPath($path)->setHeaderOffset(0);
        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;
                $rowErrors = $this->validateRequiredAndCoords($record, ['ad', 'kategori', 'lat', 'lon', 'osm_id']);

                if ($rowErrors) {
                    $errors[] = ['row' => $offset + 2, 'issues' => $rowErrors];
                    continue;
                }

                ChargingStation::updateOrCreate(
                    ['source_type' => 'candidate', 'external_id' => $record['osm_id']],
                    [
                        'name' => $record['ad'],
                        'category' => $record['kategori'],
                        'lat' => $record['lat'],
                        'lon' => $record['lon'],
                    ]
                );

                $valid++;
            }
        });

        return $this->log('candidate_pois', $originalFilename, $total, $valid, $errors);
    }

    public function importExistingChargers(string $path, string $originalFilename): DatasetImport
    {
        $csv = Reader::createFromPath($path)->setHeaderOffset(0);
        $csv->setDelimiter($this->detectDelimiter($path));
        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;

                // The source export sometimes encodes lat/lon with extra
                // thousands-separator periods (e.g. "411.219.176.411"
                // instead of "41.1219176411"). Normalize before validating.
                if (isset($record['lat'])) {
                    $record['lat'] = $this->normalizeCoordinate($record['lat']);
                }
                if (isset($record['lon'])) {
                    $record['lon'] = $this->normalizeCoordinate($record['lon']);
                }

                $rowErrors = $this->validateRequiredAndCoords($record, ['ad', 'istasyon_no', 'lat', 'lon']);

                if ($rowErrors) {
                    $errors[] = ['row' => $offset + 2, 'issues' => $rowErrors];
                    continue;
                }

                ChargingStation::updateOrCreate(
                    ['source_type' => 'existing', 'external_id' => $record['istasyon_no']],
                    [
                        'name' => $record['ad'],
                        'address' => $record['adres'] ?? null,
                        'operator' => $record['operator'] ?? null,
                        'distributor' => $record['dagitim_sirketi'] ?? null,
                        'lat' => $record['lat'],
                        'lon' => $record['lon'],
                    ]
                );

                $valid++;
            }
        });

        return $this->log('existing_chargers', $originalFilename, $total, $valid, $errors);
    }

    public function importSockets(string $path, string $originalFilename): DatasetImport
    {
        $csv = Reader::createFromPath($path)->setHeaderOffset(0);
        $stationIds = ChargingStation::existing()->pluck('id', 'external_id');
        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, $stationIds, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;
                $stationId = $stationIds[$record['ISTASYON_NO'] ?? null] ?? null;

                if (! $stationId) {
                    $errors[] = ['row' => $offset + 2, 'issues' => ['unknown station (import existing_chargers first)']];
                    continue;
                }

                Socket::updateOrCreate(
                    ['charging_station_id' => $stationId, 'socket_no' => $record['SOKET_NO']],
                    [
                        'power_kw' => $record['SOKET_GUCU'] ?? null,
                        'socket_type' => $record['SOKET_TIPI'] ?? null,
                        'socket_category' => $record['SOKET_TURU'] ?? null,
                    ]
                );

                $valid++;
            }
        });

        DB::statement('
            UPDATE charging_stations cs
            SET socket_count = (SELECT COUNT(*) FROM sockets s WHERE s.charging_station_id = cs.id)
            WHERE cs.source_type = "existing"
        ');

        return $this->log('sockets', $originalFilename, $total, $valid, $errors);
    }

    public function importTrafficDemand(string $path, string $originalFilename): DatasetImport
    {
        $csv = Reader::createFromPath($path)->setHeaderOffset(0);
        $total = 0;
        $valid = 0;
        $errors = [];

        DB::transaction(function () use ($csv, &$total, &$valid, &$errors) {
            foreach ($csv->getRecords() as $offset => $record) {
                $total++;
                $rowErrors = $this->validateRequiredAndCoords($record, ['GEOHASH', 'lat', 'lon']);

                if ($rowErrors) {
                    $errors[] = ['row' => $offset + 2, 'issues' => $rowErrors];
                    continue;
                }

                DemandPoint::updateOrCreate(
                    ['geohash' => $record['GEOHASH']],
                    [
                        'lat' => $record['lat'],
                        'lon' => $record['lon'],
                        'total_vehicles' => $record['total_vehicles'] ?? null,
                        'mean_vehicles_per_hour' => $record['mean_vehicles_per_hour'] ?? null,
                        'mean_speed' => $record['mean_speed'] ?? null,
                        'min_speed' => $record['min_speed'] ?? null,
                        'hours_observed' => $record['hours_observed'] ?? null,
                        'peak_vehicles' => $record['peak_vehicles'] ?? null,
                        'weekend_vehicles' => $record['weekend_vehicles'] ?? null,
                        'demand_score' => $record['demand_score'] ?? null,
                    ]
                );

                $valid++;
            }
        });

        return $this->log('traffic_demand', $originalFilename, $total, $valid, $errors);
    }

    private function validateRequiredAndCoords(array $record, array $requiredFields): array
    {
        $issues = [];

        foreach ($requiredFields as $field) {
            if (! isset($record[$field]) || $record[$field] === '') {
                $issues[] = "Missing required field: {$field}";
            }
        }

        if (isset($record['lat']) && $record['lat'] !== '') {
            if (! is_numeric($record['lat'])) {
                $issues[] = 'lat is not numeric';
            } elseif ($record['lat'] < 39 || $record['lat'] > 43) {
                $issues[] = 'lat outside plausible Istanbul range';
            }
        }

        if (isset($record['lon']) && $record['lon'] !== '') {
            if (! is_numeric($record['lon'])) {
                $issues[] = 'lon is not numeric';
            } elseif ($record['lon'] < 25 || $record['lon'] > 32) {
                $issues[] = 'lon outside plausible Istanbul range';
            }
        }

        return $issues;
    }

    /**
     * The existing-chargers export uses ';' while the others use ','.
     * Sniff the header line so the same upload endpoint shape works for both.
     */
    private function detectDelimiter(string $path): string
    {
        $firstLine = fgets(fopen($path, 'r'));

        return substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';
    }

    /**
     * The existing-chargers export sometimes encodes lat/lon with extra
     * thousands-separator periods (e.g. "411.219.176.411" instead of
     * "41.1219176411"). This strips all periods and reinserts the decimal
     * point after the first two digits, which recovers the correct value.
     * Only triggers when more than one '.' is present, so normally
     * formatted coordinates from other datasets are left untouched.
     */
    private function normalizeCoordinate(string $value): string
    {
        if (substr_count($value, '.') <= 1) {
            return $value;
        }

        $digits = str_replace('.', '', $value);

        return substr($digits, 0, 2) . '.' . substr($digits, 2);
    }

    private function log(string $type, string $filename, int $total, int $valid, array $errors): DatasetImport
{
    $errorCount = count($errors);
    $truncatedErrors = array_slice($errors, 0, 100);

    if ($errorCount > 100) {
        $truncatedErrors[] = ['note' => "…and " . ($errorCount - 100) . " more rows with errors (truncated for storage)"];
    }

    return DatasetImport::create([
        'dataset_type' => $type,
        'original_filename' => $filename,
        'total_rows' => $total,
        'valid_rows' => $valid,
        'invalid_rows' => $total - $valid,
        'errors' => $truncatedErrors,
        'imported_at' => now(),
    ]);
}
}