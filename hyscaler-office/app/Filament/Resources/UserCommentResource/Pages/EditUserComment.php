<?php

namespace App\Filament\Resources\UserCommentResource\Pages;

use App\Filament\Resources\UserCommentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUserComment extends EditRecord
{
    protected static string $resource = UserCommentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
