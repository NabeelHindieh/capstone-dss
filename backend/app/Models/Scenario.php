<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scenario extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'status'];

    public function stations(): HasMany
    {
        return $this->hasMany(ChargingStation::class);
    }

    public function optimizationResults(): HasMany
    {
        return $this->hasMany(OptimizationResult::class);
    }
}
