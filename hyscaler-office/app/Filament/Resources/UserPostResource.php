<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserPostResource\Pages;
use App\Filament\Resources\UserPostResource\RelationManagers;
use App\Models\UserPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserPostResource extends Resource
{
    protected static ?string $model = UserPost::class;
    protected static ?string $navigationLabel = 'User\'s Posts';
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'User Management';


    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                Forms\Components\Textarea::make('description')->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\FileUpload::make('image_path')  // Image field for S3 upload
                    ->label("image")
                    ->directory('posts')
                    ->disk('s3')
                    ->visibility('private')
                    ->preserveFilenames()

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable(),
                TextColumn::make('description')->limit(50),
                TextColumn::make('user.name')->label('User')->sortable()->searchable(),
                TextColumn::make('created_at')->label('Created At')->dateTime(),
                // ImageColumn::make('image_path')->label('Image')->disk('s3'),  // Display image URL

            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
            ]);
        // ->bulkActions([
        //     Tables\Actions\BulkActionGroup::make([
        //         Tables\Actions\DeleteBulkAction::make(),
        //     ]),
        // ]);
    }

    // public static function getRelations(): array
    // {
    //     return [
    //         //
    //     ];
    // }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserPosts::route('/'),
            'create' => Pages\CreateUserPost::route('/create'),
            'edit' => Pages\EditUserPost::route('/{record}/edit'),
        ];
    }
}
