<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckStatusController extends Controller
{
    public function checkStatus()
    {
        // 检查用户是否已登录
        if (Auth::check()) {
            // 获取用户角色
            $role = Auth::user()->role;

            // 根据角色重定向到对应页面
            switch ($role) {
                case 'student':
                    return redirect()->route('student');
                case 'admin':
                    return redirect()->route('admin');
                case 'lecture':
                    return redirect()->route('lecture');
                default:
                    abort(403, 'Unauthorized action.');
            }
        }

        // 未登录用户返回主页
        return Inertia::render('Home');
    }
}
