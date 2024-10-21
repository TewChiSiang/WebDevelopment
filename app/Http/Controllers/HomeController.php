<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return inertia('Home', [
            'message' => 'Welcome to the Home page!',
        ]);
    }
}
