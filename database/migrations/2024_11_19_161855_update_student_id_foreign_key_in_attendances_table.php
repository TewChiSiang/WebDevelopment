<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Ensure the column is of the correct type
            $table->unsignedBigInteger('student_id')->change();
    
            // Add the new foreign key constraint
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
        });
    }
    
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Drop the new foreign key
            $table->dropForeign(['student_id']);
    
            // Restore the column type if needed
            $table->bigInteger('student_id')->change();
        });
    }
    
};
