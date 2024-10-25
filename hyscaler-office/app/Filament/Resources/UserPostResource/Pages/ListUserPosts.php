<?php

namespace App\Filament\Resources\UserPostResource\Pages;

use App\Filament\Resources\UserPostResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUserPosts extends ListRecords
{
    protected static string $resource = UserPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
