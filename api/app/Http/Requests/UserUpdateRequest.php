<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // L'utilisateur ne peut mettre à jour que son propre profil
        return $this->user()->id === (int) $this->route('user');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'sometimes', 
                'string', 
                'max:50', 
                Rule::unique('users')->ignore($this->user()->id)
            ],
            'email' => [
                'sometimes', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($this->user()->id)
            ],
            'password' => [
                'sometimes',
                'string', 
                'confirmed', 
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'current_password' => ['required_with:password', 'current_password'],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'push_enabled' => ['sometimes', 'boolean'],
            'push_token' => ['sometimes', 'nullable', 'string']
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
            'username.unique' => 'Ce nom d\'utilisateur est déjà utilisé',
            'email.email' => 'Veuillez entrer une adresse email valide',
            'email.unique' => 'Cette adresse email est déjà utilisée',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas',
            'current_password.required_with' => 'Votre mot de passe actuel est requis pour changer de mot de passe',
            'current_password.current_password' => 'Le mot de passe actuel est incorrect',
            'avatar.image' => 'Le fichier doit être une image',
            'avatar.max' => 'L\'image ne doit pas dépasser 2Mo'
        ];
    }
}
