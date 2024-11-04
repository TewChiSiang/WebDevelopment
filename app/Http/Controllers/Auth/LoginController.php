<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function redirectTo(Request $request)
    {
        // 验证请求
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        // 尝试登录
        if (Auth::attempt($request->only('email', 'password'))) {
            // 登录成功后重定向到不同的页面，基于用户角色
            $user = Auth::user();
            if ($user->role === 'student') {
                return redirect()->route('student');
            } elseif ($user->role === 'admin') {
                return redirect()->route('admin');
            } else {
                return redirect()->route('lecture');
            }
        }

        // 登录失败，返回错误
        return response()->json([
            'errors' => [
                'email' => ['Invalid credentials.'],  // 错误消息放在字段内，方便前端显示
            ]
        ], 422);
    }
}
