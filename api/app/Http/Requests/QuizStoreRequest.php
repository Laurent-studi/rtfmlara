<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuizStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Tout utilisateur authentifié peut créer un quiz
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'category' => ['nullable', 'string', 'max:50'],
            'time_per_question' => ['nullable', 'integer', 'min:5', 'max:300'],
            'time_limit' => ['nullable', 'integer', 'min:30', 'max:3600'],
            'difficulty_level' => ['nullable', 'integer', 'min:1', 'max:5'],
            'multiple_answers' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'publish_date' => ['nullable', 'date', 'after_or_equal:today'],
            'image_url' => ['nullable', 'url'],
            'image' => ['nullable', 'image', 'max:5120'], // 5MB max
            'meta_data' => ['nullable', 'array'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            
            // Questions initiales (optionnelles)
            'questions' => ['nullable', 'array'],
            'questions.*.question_text' => ['required_with:questions', 'string', 'max:500'],
            'questions.*.points' => ['nullable', 'integer', 'min:1', 'max:100'],
            'questions.*.order_index' => ['nullable', 'integer', 'min:0'],
            'questions.*.answers' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.answers.*.answer_text' => ['required', 'string', 'max:255'],
            'questions.*.answers.*.is_correct' => ['required', 'boolean']
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
            'title.required' => 'Le titre du quiz est requis',
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
            'questions.*.question_text.required_with' => 'Le texte de la question est requis',
            'questions.*.answers.min' => 'Chaque question doit avoir au moins 2 réponses',
            'questions.*.answers.*.answer_text.required' => 'Le texte de la réponse est requis',
            'questions.*.answers.*.is_correct.required' => 'Vous devez indiquer si la réponse est correcte ou non'
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
