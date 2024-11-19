<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\Auth;
use TCG\Voyager\Models\Role;

class CheckRole
{
    public function handle($request, Closure $next, $role)
    {
        // Check if the authenticated user has the specified role
        if (Auth::check() && Auth::user()->role->name === $role) {
            return $next($request);
        }
    
        // Redirect if the user does not have the required role
        return redirect('/');
    }
    
}