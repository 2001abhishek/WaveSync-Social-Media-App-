<?php

namespace App\Filament\Resources\UserLikeResource\Pages;

use App\Filament\Resources\UserLikeResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUserLike extends CreateRecord
{
    protected static string $resource = UserLikeResource::class;
}
