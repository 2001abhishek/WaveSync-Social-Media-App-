<?php

namespace App\Exceptions;

use GraphQL\Error\Error;
use Nuwave\Lighthouse\Execution\ErrorHandler;

class GraphQLHandler implements ErrorHandler
{
    public function __invoke( $error, \Closure $next): array
    {
        // Call the next handler
        $error = $next($error);

        // Remove the extensions
        unset($error['extensions']);

        return [
            'message' => $error['message'],
            'locations' => $error['locations'],
            'path' => $error['path'],
        ];
    }
}