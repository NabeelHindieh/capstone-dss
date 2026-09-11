<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChargingStation extends Model
{
    use HasFactory;

    protected $fillable = [
        'scenario_id', 'source_type', 'external_id', 'name', 'category',
        'address', 'operator', 'distributor', 'lat', 'lon',
        'capacity_kw', 'socket_count',
    ];

    protected $casts = [
        'lat' => 'float',
        'lon' => 'float',
        'capacity_kw' => 'float',
    ];

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }

    public function sockets(): HasMany
    {
        return $this->hasMany(Socket::class);
    }

    public function optimizationResult(): HasOne
    {
        return $this->hasOne(OptimizationResult::class);
    }

    public function scopeExisting($query)
    {
        return $query->where('source_type', 'existing');
    }

    public function scopeCandidate($query)
    {
        return $query->where('source_type', 'candidate');
    }

    public function scopeOptimized($query)
    {
        return $query->where('source_type', 'optimized');
    }
}
