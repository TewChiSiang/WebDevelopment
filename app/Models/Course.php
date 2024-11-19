<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Course extends Model
{

    public $table = 'courses';

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $fillable = [
        'id',
        'course_id',
        'course_name',
        'course_time',
        'lecture_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_course')
            ->withTimestamps();
    }

    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}