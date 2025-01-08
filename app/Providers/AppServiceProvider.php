<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => [
                'user' => fn() => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'role_id') : null,
            ],
            'flash' => function () {
                return [
                    'status' => session('status'),
                    'error' => session('error'),
                ];
            },
        ]);
    }
}
