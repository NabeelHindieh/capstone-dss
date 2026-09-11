<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sockets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('charging_station_id')->constrained('charging_stations')->cascadeOnDelete();
            $table->string('socket_no')->nullable();
            $table->decimal('power_kw', 8, 2)->nullable();
            $table->string('socket_type')->nullable();   // AC / DC
            $table->string('socket_category')->nullable(); // e.g. DC_CCS
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sockets');
    }
};
