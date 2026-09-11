<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatasetImport extends Model
{
    protected $fillable = [
        'dataset_type', 'original_filename', 'total_rows', 'valid_rows',
        'invalid_rows', 'errors', 'imported_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'imported_at' => 'datetime',
    ];
}
