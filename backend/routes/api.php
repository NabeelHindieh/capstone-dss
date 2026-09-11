<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\MapController;
use App\Http\Controllers\Api\ScenarioController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

Route::get('/map/layers', [MapController::class, 'layers']);
Route::get('/map/demand', [MapController::class, 'demand']);

Route::get('/scenarios/compare', [ScenarioController::class, 'compare']);
Route::apiResource('scenarios', ScenarioController::class);

Route::get('/imports', [ImportController::class, 'history']);
Route::post('/import/candidate-pois', [ImportController::class, 'candidatePois']);
Route::post('/import/existing-chargers', [ImportController::class, 'existingChargers']);
Route::post('/import/sockets', [ImportController::class, 'sockets']);
Route::post('/import/traffic-demand', [ImportController::class, 'trafficDemand']);
Route::post('/import/optimization-results', [ImportController::class, 'optimizationResults']);
Route::post('/import/simulation-results', [ImportController::class, 'simulationResults']);
Route::delete('/import/{type}', [ImportController::class, 'clear']);