<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserCommentResource\Pages;
use App\Filament\Resources\UserCommentResource\RelationManagers;
use App\Models\UserComment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserCommentResource extends Resource
{
    protected static ?string $model = UserComment::class;
    protected static ?string $navigationLabel = 'User\'s Comments';
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-oval-left';
    protected static ?string $navigationGroup = 'User Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\Select::make('user_post_id')
                    ->relationship('post', 'id')
                    ->required(),
                Forms\Components\Textarea::make('content')
                    ->required(),
                Forms\Components\Select::make('master_comment_id')
                    ->relationship('nestedComments', 'content')
                    ->label('Reply to Comment'),
            ]);
    }
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable(),
                TextColumn::make('user_post_id')->label('POST ID')->sortable(),
                TextColumn::make('master_comment_id')->label('Master Comment ID')->sortable(),
                TextColumn::make('user.name')->label('User')->sortable()->searchable(),
                TextColumn::make('content')->limit(50),
                TextColumn::make('created_at')->label('Created At')->dateTime(),

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
            'index' => Pages\ListUserComments::route('/'),
            'create' => Pages\CreateUserComment::route('/create'),
            'edit' => Pages\EditUserComment::route('/{record}/edit'),
        ];
    }
}
