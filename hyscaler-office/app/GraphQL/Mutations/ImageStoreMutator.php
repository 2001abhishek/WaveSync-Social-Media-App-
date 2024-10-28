<?php

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\ImageStore;

class ImageStoreMutator
{
    public function generatePresignedUrl($root, array $args)
    {
        // Get the uploaded file from arguments
        $file = $args['file']; // Make sure 'file' is the name of the file input in GraphQL

        // Define a file path where the image will be stored in S3
        $filename = Str::random(10) . '.' . $file->getClientOriginalExtension();
        $path = 'uploads/' . $filename;

        // Upload the file to S3
        $file->storeAs('uploads', $filename, 's3');

        // Generate a presigned URL for the uploaded file
        $presignedUrl = Storage::disk('s3')->temporaryUrl(
            $path,
            now()->addMinutes(50) // URL expires in 5 minutes
        );

        // Save the details to the database
        $imageStore = new ImageStore();
        $imageStore->image_name = $filename;
        $imageStore->presigned_url = $presignedUrl;
        $imageStore->save();

        return [
            'status' => true,
            'message' => ' URL generated successfully',
            'presigned_url' => $presignedUrl
        ];
    }
    public function uploadImageWithPresignedUrl($root, array $args)
    {
        $imageName = $args['image_name'];
        $presignedUrl = $args['presigned_url'];

        // Upload the image using the presigned URL.
        // Assuming the image file is being uploaded via a frontend or an external process.

        // Use the image name and construct the public URL based on S3.
        $publicUrl = Storage::disk('s3')->url('/' . $imageName);

        // Store the public URL in the database.
        $imageStore = new ImageStore();
        $imageStore->image_name = $imageName;
        $imageStore->public_url = $publicUrl;
        $imageStore->save();

        return [
            'status' => true,
            'message' => 'Image uploaded successfully and public URL stored',
            'public_url' => $publicUrl
        ];
    }
}

