<?php

namespace App\Http\Requests;

use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;

class QuizUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $quiz = Quiz::findOrFail($this->route('quiz'));
        
        // Seul le créateur du quiz ou un administrateur peut le modifier
        return $this->user()->id === $quiz->creator_id || 
               $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'min:3', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'category_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'category' => ['sometimes', 'nullable', 'string', 'max:50'],
            'time_per_question' => ['sometimes', 'nullable', 'integer', 'min:5', 'max:300'],
            'time_limit' => ['sometimes', 'nullable', 'integer', 'min:30', 'max:3600'],
            'difficulty_level' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
            'multiple_answers' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
            'publish_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
            'image_url' => ['sometimes', 'nullable', 'url'],
            'image' => ['sometimes', 'nullable', 'image', 'max:5120'], // 5MB max
            'meta_data' => ['sometimes', 'nullable', 'array'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            'status' => ['sometimes', 'string', 'in:draft,published,archived']
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.min' => 'Le titre doit contenir au moins :min caractères',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas',
            'time_per_question.min' => 'Le temps par question doit être d\'au moins :min secondes',
            'time_per_question.max' => 'Le temps par question ne peut pas dépasser :max secondes',
            'time_limit.min' => 'La durée totale du quiz doit être d\'au moins :min secondes',
            'time_limit.max' => 'La durée totale du quiz ne peut pas dépasser :max secondes',
            'difficulty_level.min' => 'Le niveau de difficulté doit être compris entre 1 et 5',
            'difficulty_level.max' => 'Le niveau de difficulté doit être compris entre 1 et 5',
            'publish_date.after_or_equal' => 'La date de publication doit être aujourd\'hui ou ultérieure',
            'image.image' => 'Le fichier doit être une image',
            'image.max' => 'L\'image ne doit pas dépasser 5Mo',
            'status.in' => 'Le statut doit être l\'une des valeurs suivantes : brouillon, publié, archivé'
        ];
    }
    
    /**
     * Préparer les données pour la validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('multiple_answers')) {
            $this->merge([
                'multiple_answers' => filter_var($this->multiple_answers, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
        
        if ($this->has('is_published')) {
            $this->merge([
                'is_published' => filter_var($this->is_published, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
        
        if ($this->has('is_featured')) {
            $this->merge([
                'is_featured' => filter_var($this->is_featured, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
    }
}
