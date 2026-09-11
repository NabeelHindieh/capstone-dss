<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores the Electrical & Electronics Engineering team's simulation output
     * for one optimized station. Matches Report Table 3: PV generation, battery
     * utilization, charging demand, energy efficiency, power balance, feasibility.
     */
    public function up(): void
    {
        Schema::create('simulation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('optimization_result_id')->constrained('optimization_results')->cascadeOnDelete();

            $table->decimal('pv_generation_kwh', 10, 2)->nullable();
            $table->decimal('battery_utilization_pct', 5, 2)->nullable();
            $table->decimal('charging_demand_kwh', 10, 2)->nullable();
            $table->decimal('energy_efficiency_pct', 5, 2)->nullable();
            $table->decimal('power_balance_kw', 10, 2)->nullable();
            $table->enum('feasibility_status', ['feasible', 'marginal', 'infeasible'])->nullable();

            $table->timestamps();

            $table->unique('optimization_result_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_results');
    }
};
