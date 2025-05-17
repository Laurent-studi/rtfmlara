<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class PdfExport
 * 
 * @property int $id
 * @property int|null $user_id
 * @property int|null $quiz_id
 * @property string $file_path
 * @property string $type
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Quiz|null $quiz
 * @property User|null $user
 *
 * @package App\Models
 */
class PdfExport extends Model
{
	protected $table = 'pdf_exports';

	protected $casts = [
		'user_id' => 'int',
		'quiz_id' => 'int'
	];

	protected $fillable = [
		'user_id',
		'quiz_id',
		'file_path',
		'type'
	];

	public function quiz()
	{
		return $this->belongsTo(Quiz::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
