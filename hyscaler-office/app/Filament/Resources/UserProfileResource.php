<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserProfileResource\Pages;
use App\Models\UserProfile;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class UserProfileResource extends Resource
{
    protected static ?string $model = UserProfile::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-circle';
    protected static ?string $navigationGroup = 'User Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                    
                Forms\Components\TextInput::make('location')
                    ->label('Location')
                    ->nullable(),

                Forms\Components\Textarea::make('about_user')
                    ->label('About User')
                    ->nullable(),

                Forms\Components\FileUpload::make('avatar_path')
                    ->label('Avatar')
                    ->disk('s3')
                    ->directory('profile/avatar') // Specify the directory for avatar
                    ->required(),

                Forms\Components\FileUpload::make('banner_path')
                    ->label('Banner Image')
                    ->disk('s3')
                    ->directory('profile/banner') // Specify the directory for banner
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')->label('User')->sortable()->searchable(),
                ImageColumn::make('avatar_path')->label('Avatar')->disk('s3'),
                Tables\Columns\TextColumn::make('location')->label('Location'),
                Tables\Columns\TextColumn::make('about_user')->label('About User'),
                Tables\Columns\TextColumn::make('created_at')->label('Created At'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserProfiles::route('/'),
            'create' => Pages\CreateUserProfile::route('/create'),
            'edit' => Pages\EditUserProfile::route('/{record}/edit'),
        ];
    }

    public static function afterSaving(UserProfile $userProfile): void
    {
        // Check if there's an existing profile
        $existingProfile = UserProfile::find($userProfile->id);

        // Handle avatar replacement
        if ($existingProfile && $userProfile->avatar_path !== $existingProfile->avatar_path) {
            // If an old avatar exists, delete it from S3
            if ($existingProfile->avatar_path) {
                Storage::disk('s3')->delete($existingProfile->avatar_path);
            }
        }

        // Handle banner replacement
        if ($existingProfile && $userProfile->banner_path !== $existingProfile->banner_path) {
            // If an old banner exists, delete it from S3
            if ($existingProfile->banner_path) {
                Storage::disk('s3')->delete($existingProfile->banner_path);
            }
        }
    }
}
