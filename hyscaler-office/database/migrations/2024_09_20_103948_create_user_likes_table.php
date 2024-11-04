<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersLikesTable extends Migration
{
    public function up()
    {
        Schema::create('users_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_post_id')->nullable()->constrained('user_posts')->onDelete('cascade');
            $table->foreignId('user_comment_id')->nullable()->constrained('users_comments')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'user_post_id', 'master_comment_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('users_likes');
    }
}