<?php

namespace App\Filament\Resources\UserConnectionResource\Pages;

use App\Filament\Resources\UserConnectionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUserConnection extends EditRecord
{
    protected static string $resource = UserConnectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
