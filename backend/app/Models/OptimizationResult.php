<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OptimizationResult extends Model
{
    protected $fillable = [
        'scenario_id', 'charging_station_id', 'capacity_kw', 'operational_cost',
        'demand_coverage', 'estimated_emissions_kg', 'priority_rank',
    ];

    protected $casts = [
        'capacity_kw' => 'float',
        'operational_cost' => 'float',
        'demand_coverage' => 'float',
        'estimated_emissions_kg' => 'float',
    ];

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(ChargingStation::class, 'charging_station_id');
    }

    public function simulationResult(): HasOne
    {
        return $this->hasOne(SimulationResult::class);
    }
}
