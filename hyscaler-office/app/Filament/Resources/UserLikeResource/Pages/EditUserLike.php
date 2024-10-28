<?php

namespace App\Filament\Resources\UserLikeResource\Pages;

use App\Filament\Resources\UserLikeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUserLike extends EditRecord
{
    protected static string $resource = UserLikeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
