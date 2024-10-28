<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageStore extends Model
{
    use HasFactory;

    protected $fillable = ['image_name', 'presigned_url'];
}
