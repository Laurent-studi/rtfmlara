<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AutoFillControllers extends Command
{
    protected $signature = 'autofill:controllers';
    protected $description = 'Auto-remplit les controllers existants en fonction des modèles et de la base de données';

    public function handle()
    {
        $modelPath = app_path('Models');
        $controllerPath = app_path('Http/Controllers/Api');
        $controllerFiles = File::allFiles(app_path('Http/Controllers'));

        $modelFiles = File::files($modelPath);

        foreach ($modelFiles as $file) {
            $modelName = $file->getFilenameWithoutExtension();
            $fullModelClass = "App\\Models\\$modelName";

            if (!class_exists($fullModelClass)) {
                require_once $file->getPathname();
            }

            $table = Str::snake(Str::pluralStudly($modelName));
            if (!Schema::hasTable($table)) {
                $this->warn("Table $table non trouvée pour le modèle $modelName");
                continue;
            }

            $controllerName = "{$modelName}Controller.php";
            $controllerFile = $controllerPath . '/' . $controllerName;

            if (!File::exists($controllerFile)) {
                $this->warn("Controller $controllerName introuvable.");
                continue;
            }

            $controllerCode = File::get($controllerFile);
            $columns = Schema::getColumnListing($table);
            $fillable = array_diff($columns, ['id', 'created_at', 'updated_at']);

            $methods = [
                'index' => $this->generateIndex($modelName),
                'show' => $this->generateShow($modelName),
                'store' => $this->generateStore($modelName, $fillable),
                'update' => $this->generateUpdate($modelName, $fillable),
                'destroy' => $this->generateDestroy($modelName),
            ];

            foreach ($methods as $method => $code) {
                if (!Str::contains($controllerCode, "function $method(")) {
                    $controllerCode = preg_replace('/}\s*$/', "\n\n" . $code . "\n}", $controllerCode);
                    $this->info("Méthode $method ajoutée à $controllerName");
                }
            }

            File::put($controllerFile, $controllerCode);
        }

        $this->info('✅ Tous les controllers ont été traités.');
    }

    protected function generateIndex($model)
    {
        $var = $this->var($model);
        $view = $this->view($model);
    
        return <<<PHP
        public function index()
        {
            \${$var}s = \\App\\Models\\$model::all();
            return view('$view.index', compact('{$var}s'));
        }
    PHP;
    }

    protected function generateShow($model)
    {
        $var = $this->var($model);
        $view = $this->view($model);
        
        return <<<PHP
    public function show(\\App\\Models\\$model \${$var})
    {
        return view('$view.show', compact('$var'));
    }
PHP;
    }

    protected function generateStore($model, $fields)
    {
        $validation = collect($fields)->map(fn($f) => "'$f' => 'required'")->implode(",\n            ");
        $route = $this->route($model);

        return <<<PHP
    public function store(Request \$request)
    {
        \$validated = \$request->validate([
            $validation
        ]);

        \\App\\Models\\$model::create(\$validated);

        return redirect()->route('$route.index');
    }
PHP;
    }

    protected function generateUpdate($model, $fields)
    {
        $validation = collect($fields)->map(fn($f) => "'$f' => 'required'")->implode(",\n            ");
        $var = $this->var($model);
        $route = $this->route($model);

        return <<<PHP
    public function update(Request \$request, \\App\\Models\\$model \${$var})
    {
        \$validated = \$request->validate([
            $validation
        ]);

        \${$var}->update(\$validated);

        return redirect()->route('$route.index');
    }
PHP;
    }

    protected function generateDestroy($model)
    {
        $var = $this->var($model);
        $route = $this->route($model);
        
        return <<<PHP
    public function destroy(\\App\\Models\\$model \${$var})
    {
        \${$var}->delete();

        return redirect()->route('$route.index');
    }
PHP;
    }

    protected function var($model)
    {
        return Str::camel($model);
    }

    protected function view($model)
    {
        return Str::kebab(Str::pluralStudly($model));
    }

    protected function route($model)
    {
        return Str::kebab(Str::pluralStudly($model));
    }
}
