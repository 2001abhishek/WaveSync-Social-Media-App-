<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserConnectionResource\Pages;
use App\Filament\Resources\UserConnectionResource\RelationManagers;
use App\Models\UserConnection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\BooleanColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserConnectionResource extends Resource
{
    protected static ?string $model = UserConnection::class;
    protected static ?string $navigationLabel = 'User\'s Connections';
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'User Management';


    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('sender_id')
                    ->relationship('sender', 'name')
                    ->required(),
                Forms\Components\Select::make('receiver_id')
                    ->relationship('receiver', 'name')
                    ->required(),
                Forms\Components\Toggle::make('status')
                    ->label('Connection Status')
                    ->default(false),
            ]);
    }

        public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable(),
                TextColumn::make('sender.name')->label('Sender')->sortable()->searchable(),
                TextColumn::make('receiver.name')->label('Receiver')->sortable()->searchable(),
                BooleanColumn::make('status')->label('Connection Accepted')->sortable(),
                TextColumn::make('created_at')->label('Request Sent At')->dateTime(),

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
            'index' => Pages\ListUserConnections::route('/'),
            'create' => Pages\CreateUserConnection::route('/create'),
            'edit' => Pages\EditUserConnection::route('/{record}/edit'),
        ];
    }
}
