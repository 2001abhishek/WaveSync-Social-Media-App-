<?php

namespace App\Filament\Resources\UserPostResource\Pages;

use App\Filament\Resources\UserPostResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUserPost extends CreateRecord
{
    protected static string $resource = UserPostResource::class;
}
