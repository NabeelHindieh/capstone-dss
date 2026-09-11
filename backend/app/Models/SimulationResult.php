<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimulationResult extends Model
{
    protected $fillable = [
        'optimization_result_id', 'pv_generation_kwh', 'battery_utilization_pct',
        'charging_demand_kwh', 'energy_efficiency_pct', 'power_balance_kw',
        'feasibility_status',
    ];

    public function optimizationResult(): BelongsTo
    {
        return $this->belongsTo(OptimizationResult::class);
    }
}
