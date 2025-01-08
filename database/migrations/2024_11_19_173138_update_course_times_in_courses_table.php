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
        Schema::table('courses', function (Blueprint $table) {
            // Drop the existing `course_time` column
            $table->dropColumn('course_time');

            // Add the new `course_start_time` and `course_end_time` columns
            $table->time('course_start_time');  // Add start time column
            $table->time('course_end_time');    // Add end time column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Add back the `course_time` column if rolling back
            $table->time('course_time');

            // Drop the `course_start_time` and `course_end_time` columns if rolling back
            $table->dropColumn('course_start_time');
            $table->dropColumn('course_end_time');
        });
    }
};
