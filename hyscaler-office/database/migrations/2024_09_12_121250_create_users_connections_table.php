<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersConnectionsTable extends Migration
{
    public function up()
    {
        Schema::create('users_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->boolean('status')->default(false);
            $table->timestamps();

            $table->unique(['sender_id', 'receiver_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('users_connections');
    }
}