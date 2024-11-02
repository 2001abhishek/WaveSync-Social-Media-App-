import React from 'react';
import Image from 'next/image';

interface ImageGridProps {
  images: string[];
  onImageClick: (images: string[]) => void;
  className?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick, className = '' }) => {
  if (!images || images.length === 0) return null;

  const baseUrl = 'https://hyscaler-social-app.s3.eu-north-1.amazonaws.com/';

  // Single image display
  if (images.length === 1) {
    return (
      <div 
        className={`cursor-pointer ${className}`}
        onClick={() => onImageClick(images.map(img => `${baseUrl}${img}`))}
      >
        <div className="relative h-[200px] w-full">
          <Image
            src={`${baseUrl}${images[0]}`}
            alt="Post image"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </div>
    );
  }

  // Multiple images grid
  return (
    <div 
      className={`grid grid-cols-2 gap-1 cursor-pointer ${className}`}
      onClick={() => onImageClick(images.map(img => `${baseUrl}${img}`))}
    >
      {images.slice(0, 4).map((image, index) => (
        <div key={index} className="relative h-32">
          <Image
            src={`${baseUrl}${image}`}
            alt={`Post image ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
          {index === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white text-lg font-bold">
                +{images.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;