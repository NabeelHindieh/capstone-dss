<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandPoint extends Model
{
    protected $fillable = [
        'geohash', 'lat', 'lon', 'total_vehicles', 'mean_vehicles_per_hour',
        'mean_speed', 'min_speed', 'hours_observed', 'peak_vehicles',
        'weekend_vehicles', 'demand_score',
    ];

    protected $casts = [
        'lat' => 'float',
        'lon' => 'float',
        'demand_score' => 'float',
    ];
}
