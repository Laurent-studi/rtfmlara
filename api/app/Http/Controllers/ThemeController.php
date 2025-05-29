<?php

namespace App\Http\Controllers;

use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ThemeController extends Controller
{
    // Lister tous les thèmes disponibles
    public function index()
    {
        return response()->json(Theme::select('id', 'name', 'code', 'is_premium', 'is_default')->get());
    }

    // Récupérer le thème de l'utilisateur connecté
    public function getUserTheme(Request $request)
    {
        $user = $request->user();
        return response()->json(['theme' => $user->theme]);
    }

    // Changer le thème de l'utilisateur connecté
    public function setUserTheme(Request $request)
    {
        $request->validate([
            'theme' => 'required|string|exists:themes,code',
        ]);
        $user = $request->user();
        $user->theme = $request->input('theme');
        $user->save();
        return response()->json(['success' => true, 'theme' => $user->theme]);
    }
} 