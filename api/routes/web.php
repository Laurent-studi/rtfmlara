<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Routes pour la documentation API Scribe
$prefix = config('scribe.laravel.docs_url', '/docs');
$middleware = config('scribe.laravel.middleware', []);

Route::middleware($middleware)
    ->group(function () use ($prefix) {
        Route::view($prefix, 'scribe.index')->name('scribe');

        Route::get("$prefix.postman", function () {
            return new \Illuminate\Http\JsonResponse(
                \Illuminate\Support\Facades\Storage::disk('local')->get('scribe/collection.json'), 
                200, 
                [], 
                true
            );
        })->name('scribe.postman');

        Route::get("$prefix.openapi", function () {
            return response()->file(\Illuminate\Support\Facades\Storage::disk('local')->path('scribe/openapi.yaml'));
        })->name('scribe.openapi');
    });
