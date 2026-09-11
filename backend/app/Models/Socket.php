<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Socket extends Model
{
    protected $fillable = [
        'charging_station_id', 'socket_no', 'power_kw', 'socket_type', 'socket_category',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(ChargingStation::class, 'charging_station_id');
    }
}
