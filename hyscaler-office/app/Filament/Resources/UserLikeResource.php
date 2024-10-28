<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserLikeResource\Pages;
use App\Filament\Resources\UserLikeResource\RelationManagers;
use App\Models\UserLike;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserLikeResource extends Resource
{
    protected static ?string $model = UserLike::class;
    protected static ?string $navigationLabel = 'User\'s Likes';
    protected static ?string $navigationIcon = 'heroicon-o-hand-thumb-up';
    protected static ?string $navigationGroup = 'User Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                    Forms\Components\Select::make('user_post_id')
                    ->relationship('post', 'description')
                    ->required(),
                Forms\Components\Select::make('master_comment_id')
                    ->relationship('masterComment', 'content')
                    ->label('Master Comment')
                    ->nullable(),
                Forms\Components\Select::make('nested_comment_id')
                    ->relationship('nestedComment', 'content')
                    ->label('Nested Comment')
                    ->nullable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable(),
                TextColumn::make('user.name')->label('User')->sortable()->searchable(),
                TextColumn::make('post.heading')->label('Post')->sortable()->searchable()->default('-'),
                TextColumn::make('masterComment.content')->label('Master Comment')->sortable()->searchable()->default('-'),
                TextColumn::make('nestedComment.content')->label('Nested Comment')->sortable()->searchable()->default('-'),
                TextColumn::make('created_at')->label('Liked At')->dateTime(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserLikes::route('/'),
            'create' => Pages\CreateUserLike::route('/create'),
            'edit' => Pages\EditUserLike::route('/{record}/edit'),
        ];
    }
}
