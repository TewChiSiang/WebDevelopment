<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('student_id'); 
            $table->unsignedBigInteger('course_id');
            $table->datetime('check_in_time');
            $table->string('qr_code_hash')->nullable();
            $table->enum('status', ['present', 'late', 'absent'])->default('absent');

            // Set foreign key to reference `student_id` in `students` table
            $table->foreign('student_id')->references('student_id')->on('students')->cascadeOnDelete();

            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
