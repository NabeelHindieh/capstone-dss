<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charging_stations', function (Blueprint $table) {
            $table->id();

            // A station can belong to a scenario (optimized sites proposed within that scenario)
            // or be scenario-independent (existing infrastructure, raw candidate POIs).
            $table->foreignId('scenario_id')->nullable()->constrained('scenarios')->nullOnDelete();

            // existing    = real charger already in Istanbul (existing_chargers_istanbul.csv)
            // candidate   = raw POI that could host a new station (candidate_pois_clean.csv)
            // optimized   = site selected by the Industrial Engineering optimization model
            $table->enum('source_type', ['existing', 'candidate', 'optimized'])->default('candidate');

            // External identifiers from the source datasets, kept for traceability
            $table->string('external_id')->nullable()->index(); // osm_id or istasyon_no
            $table->string('name');
            $table->string('category')->nullable();             // e.g. avm, universite, hastane
            $table->string('address')->nullable();
            $table->string('operator')->nullable();
            $table->string('distributor')->nullable();

            $table->decimal('lat', 10, 7);
            $table->decimal('lon', 10, 7);

            // Populated once optimization results are available for candidate/optimized rows
            $table->decimal('capacity_kw', 8, 2)->nullable();
            $table->unsignedInteger('socket_count')->nullable();

            $table->timestamps();

            $table->index(['source_type', 'scenario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charging_stations');
    }
};
