<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class Quiz
 * 
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property int|null $creator_id
 * @property string|null $category
 * @property int $time_per_question
 * @property bool $multiple_answers
 * @property string $status
 * @property string $code
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User|null $user
 * @property Collection|Challenge[] $challenges
 * @property Collection|LearningStat[] $learning_stats
 * @property Collection|OfflineSession[] $offline_sessions
 * @property Collection|PdfExport[] $pdf_exports
 * @property Collection|Question[] $questions
 * @property Collection|QuizSession[] $quiz_sessions
 * @property Collection|TournamentMatch[] $tournament_matches
 * @property Collection|Tag[] $tags
 *
 * @package App\Models
 */
class Quiz extends Model
{
	use HasFactory;

	protected $table = 'quizzes';

	protected $casts = [
		'creator_id' => 'int',
		'time_per_question' => 'int',
		'multiple_answers' => 'bool',
		'difficulty_level' => 'integer',
		'time_limit' => 'integer',
		'is_featured' => 'boolean',
		'is_published' => 'boolean',
		'publish_date' => 'datetime',
		'meta_data' => 'array',
	];

	protected $fillable = [
		'title',
		'description',
		'creator_id',
		'category',
		'time_per_question',
		'multiple_answers',
		'status',
		'code',
		'difficulty_level',
		'time_limit',
		'is_featured',
		'is_published',
		'created_by',
		'publish_date',
		'image_url',
		'meta_data',
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'creator_id');
	}

	/**
	 * Alias pour la relation creator
	 */
	public function creator()
	{
		return $this->belongsTo(User::class, 'creator_id');
	}

	public function challenges()
	{
		return $this->hasMany(Challenge::class);
	}

	public function learning_stats()
	{
		return $this->hasMany(LearningStat::class);
	}

	public function offline_sessions()
	{
		return $this->hasMany(OfflineSession::class);
	}

	public function pdf_exports()
	{
		return $this->hasMany(PdfExport::class);
	}

	public function questions()
	{
		return $this->hasMany(Question::class);
	}

	public function quiz_sessions()
	{
		return $this->hasMany(QuizSession::class);
	}
	
	/**
	 * Alias pour la relation quiz_sessions
	 */
	public function sessions()
	{
		return $this->hasMany(QuizSession::class);
	}

	public function tournament_matches()
	{
		return $this->hasMany(TournamentMatch::class);
	}
	
	/**
	 * Obtenir les tags associés au quiz.
	 */
	public function tags(): BelongsToMany
	{
		return $this->belongsToMany(Tag::class, 'quiz_tag')
			->withTimestamps();
	}
	
	/**
	 * Obtenir un code unique pour le quiz s'il n'en a pas déjà un.
	 * 
	 * @return string
	 */
	public static function generateUniqueCode(): string
	{
		$characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$code = '';
		
		do {
			$code = '';
			for ($i = 0; $i < 6; $i++) {
				$code .= $characters[random_int(0, strlen($characters) - 1)];
			}
		} while (self::where('code', $code)->exists());
		
		return $code;
	}

	/**
	 * Get the category of the quiz.
	 */
	public function category()
	{
		return $this->belongsTo(Category::class);
	}

	/**
	 * Get the attempts for the quiz.
	 */
	public function attempts()
	{
		return $this->hasMany(QuizAttempt::class);
	}

	/**
	 * Scope a query to only include published quizzes.
	 */
	public function scopePublished($query)
	{
		return $query->where('is_published', true)
			->where(function($q) {
				$q->whereNull('publish_date')
				  ->orWhere('publish_date', '<=', now());
			});
	}

	/**
	 * Scope a query to only include featured quizzes.
	 */
	public function scopeFeatured($query)
	{
		return $query->where('is_featured', true);
	}

	/**
	 * Count the number of questions in this quiz.
	 *
	 * @return int
	 */
	public function getQuestionsCountAttribute(): int
	{
		return $this->questions()->count();
	}
}
