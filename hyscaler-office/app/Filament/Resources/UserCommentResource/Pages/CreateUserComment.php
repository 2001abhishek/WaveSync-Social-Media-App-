<?php

namespace App\Filament\Resources\UserCommentResource\Pages;

use App\Filament\Resources\UserCommentResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUserComment extends CreateRecord
{
    protected static string $resource = UserCommentResource::class;
}
