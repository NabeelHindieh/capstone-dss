<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demand_points', function (Blueprint $table) {
            $table->id();
            $table->string('geohash')->unique();
            $table->decimal('lat', 10, 7);
            $table->decimal('lon', 10, 7);
            $table->unsignedBigInteger('total_vehicles')->nullable();
            $table->decimal('mean_vehicles_per_hour', 10, 3)->nullable();
            $table->decimal('mean_speed', 6, 3)->nullable();
            $table->decimal('min_speed', 6, 2)->nullable();
            $table->unsignedInteger('hours_observed')->nullable();
            $table->decimal('peak_vehicles', 10, 3)->nullable();
            $table->decimal('weekend_vehicles', 10, 3)->nullable();
            $table->decimal('demand_score', 6, 4)->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demand_points');
    }
};
