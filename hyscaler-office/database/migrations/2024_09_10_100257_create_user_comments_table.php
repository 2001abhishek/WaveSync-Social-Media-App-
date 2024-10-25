<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('users_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_post_id')->constrained('user_posts')->onDelete('cascade');
            $table->foreignId('master_comment_id')->nullable()->constrained('users_comments')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users_comments');
    }
}