<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores the Industrial Engineering team's facility-location optimization
     * output for one station within one scenario. Matches the "Required Fields"
     * listed for Industrial Engineering in Report Table 3: station id, lat/lon
     * (via the linked charging_station), capacity, operational cost, demand
     * coverage, and emissions.
     */
    public function up(): void
    {
        Schema::create('optimization_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scenario_id')->constrained('scenarios')->cascadeOnDelete();
            $table->foreignId('charging_station_id')->constrained('charging_stations')->cascadeOnDelete();

            $table->decimal('capacity_kw', 8, 2)->nullable();
            $table->decimal('operational_cost', 12, 2)->nullable();
            $table->decimal('demand_coverage', 6, 4)->nullable(); // 0-1 share of nearby demand served
            $table->decimal('estimated_emissions_kg', 12, 3)->nullable();
            $table->unsignedInteger('priority_rank')->nullable();

            $table->timestamps();

            $table->unique(['scenario_id', 'charging_station_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('optimization_results');
    }
};
