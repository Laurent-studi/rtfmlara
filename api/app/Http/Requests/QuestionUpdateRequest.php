<?php

namespace App\Http\Requests;

use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;

class QuestionUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $question = Question::with('quiz')->findOrFail($this->route('question'));
        
        if (!$question->quiz) {
            return false;
        }
        
        // Seul le créateur du quiz ou un administrateur peut modifier des questions
        return $this->user()->id === $question->quiz->creator_id || 
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
            'question_text' => ['sometimes', 'string', 'max:500'],
            'points' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'order_index' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'media_url' => ['sometimes', 'nullable', 'url'],
            'media_type' => ['sometimes', 'nullable', 'string', 'in:image,video,audio'],
            'time_limit' => ['sometimes', 'nullable', 'integer', 'min:5', 'max:300'],
            'explanation' => ['sometimes', 'nullable', 'string', 'max:1000'],
            
            // Réponses (optionnelles lors de la mise à jour)
            'answers' => ['sometimes', 'array', 'min:2'],
            'answers.*.id' => ['sometimes', 'nullable', 'exists:answers,id'],
            'answers.*.answer_text' => ['required_with:answers', 'string', 'max:255'],
            'answers.*.is_correct' => ['required_with:answers', 'boolean'],
            'answers.*.order_index' => ['nullable', 'integer', 'min:0'],
            'answers.*.image_url' => ['nullable', 'url'],
            'answers.*._delete' => ['nullable', 'boolean'] // Marquer une réponse à supprimer
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
            'question_text.max' => 'Le texte de la question ne peut pas dépasser :max caractères',
            'points.min' => 'Les points doivent être au minimum :min',
            'points.max' => 'Les points ne peuvent pas dépasser :max',
            'media_type.in' => 'Le type de média doit être une image, une vidéo ou un audio',
            'time_limit.min' => 'Le temps limite doit être d\'au moins :min secondes',
            'time_limit.max' => 'Le temps limite ne peut pas dépasser :max secondes',
            'answers.min' => 'Au moins :min réponses sont requises',
            'answers.*.id.exists' => 'L\'identifiant de la réponse est invalide',
            'answers.*.answer_text.required_with' => 'Le texte de la réponse est requis',
            'answers.*.is_correct.required_with' => 'Vous devez indiquer si la réponse est correcte ou non'
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
                if (isset($answer['_delete'])) {
                    $answers[$key]['_delete'] = filter_var($answer['_delete'], FILTER_VALIDATE_BOOLEAN);
                }
            }
            $this->merge(['answers' => $answers]);
        }
    }
}
