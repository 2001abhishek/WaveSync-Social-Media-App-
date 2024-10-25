<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserPostsTable extends Migration
{
    public function up()
{
    Schema::create('user_posts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->text('description');
        $table->string('image_path');
        $table->string('image_path2')->nullable();
        $table->string('image_path3')->nullable();
        $table->string('image_path4')->nullable();
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('user_posts');
    }

}