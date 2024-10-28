<?php

namespace App\GraphQL\Queries;

use App\Models\ImageStore;
use Illuminate\Support\Facades\Storage;

class ImageStoreQuery
{
    public function generatePresignedUrl($root, array $args)
    {
        $imageName = $args['image_name'];
        $disk = config('filesystems.disks.s3'); // Access your S3 configuration

        $diskName = 's3'; // Ensure this matches your S3 configuration in .env
        $expiry = now()->addMinutes(5); // Presigned URL expiry time

        // Generate the presigned URL
        $url = Storage::disk($diskName)->temporaryUrl($imageName, $expiry);

        // Store in database
        $imageStore = ImageStore::create([
            'image_name' => $imageName,
            'presigned_url' => $url,
        ]);

        return [
            'status' => true,
            'presigned_url' => $imageStore->presigned_url,
        ];
    }
}
