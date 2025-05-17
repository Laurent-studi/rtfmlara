<?php

namespace App\Http\Requests;

use App\Models\Quiz;
use Illuminate\Foundation\Http\FormRequest;

class QuestionStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $quizId = $this->input('quiz_id');
        if (!$quizId) {
            return false;
        }

        $quiz = Quiz::findOrFail($quizId);
        
        // Seul le créateur du quiz ou un administrateur peut ajouter des questions
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
            'quiz_id' => ['required', 'exists:quizzes,id'],
            'question_text' => ['required', 'string', 'max:500'],
            'points' => ['nullable', 'integer', 'min:1', 'max:100'],
            'order_index' => ['nullable', 'integer', 'min:0'],
            'media_url' => ['nullable', 'url'],
            'media_type' => ['nullable', 'string', 'in:image,video,audio'],
            'time_limit' => ['nullable', 'integer', 'min:5', 'max:300'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            
            // Réponses
            'answers' => ['required', 'array', 'min:2'],
            'answers.*.answer_text' => ['required', 'string', 'max:255'],
            'answers.*.is_correct' => ['required', 'boolean'],
            'answers.*.order_index' => ['nullable', 'integer', 'min:0'],
            'answers.*.image_url' => ['nullable', 'url']
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
            'quiz_id.required' => 'L\'identifiant du quiz est requis',
            'quiz_id.exists' => 'Le quiz sélectionné n\'existe pas',
            'question_text.required' => 'Le texte de la question est requis',
            'question_text.max' => 'Le texte de la question ne peut pas dépasser :max caractères',
            'points.min' => 'Les points doivent être au minimum :min',
            'points.max' => 'Les points ne peuvent pas dépasser :max',
            'media_type.in' => 'Le type de média doit être une image, une vidéo ou un audio',
            'time_limit.min' => 'Le temps limite doit être d\'au moins :min secondes',
            'time_limit.max' => 'Le temps limite ne peut pas dépasser :max secondes',
            'answers.required' => 'Des réponses sont requises pour la question',
            'answers.min' => 'Au moins :min réponses sont requises',
            'answers.*.answer_text.required' => 'Le texte de la réponse est requis',
            'answers.*.is_correct.required' => 'Vous devez indiquer si la réponse est correcte ou non'
        ];
    }
    
    /**
     * Préparer les données pour la validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Assurez-vous que les valeurs booléennes sont correctement converties
        if ($this->has('answers')) {
            $answers = $this->input('answers');
            foreach ($answers as $key => $answer) {
                if (isset($answer['is_correct'])) {
                    $answers[$key]['is_correct'] = filter_var($answer['is_correct'], FILTER_VALIDATE_BOOLEAN);
                }
            }
            $this->merge(['answers' => $answers]);
        }
    }
}
