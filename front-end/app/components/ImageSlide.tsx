import { useState, useEffect } from "react";
import Slider from "react-slick";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ImageSlideProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ images, isOpen, onClose }) => {
  if (!isOpen || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    setImageSize({ width: 0, height: 0 });
  }, [images]);

  const PrevArrow = (props: any) => (
    <div
      {...props}
      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 cursor-pointer z-10 text-white transition-all"
    >
      &#10094;
    </div>
  );

  const NextArrow = (props: any) => (
    <div
      {...props}
      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 cursor-pointer z-10 text-white transition-all"
    >
      &#10095;
    </div>
  );

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    afterChange: (index: number) => setCurrentIndex(index),
    adaptiveHeight: true
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 pop-up">
      {/* Container for the close button */}
      <div className="absolute top-0 right-0 m-4">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main content container */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-[90vw] h-full flex items-center justify-center">
          {images.length > 1 ? (
            <div className="w-full max-w-[90vw] max-h-[90vh]">
              <Slider {...settings}>
                {images.map((image, index) => (
                  <div key={index} className="flex items-center justify-center h-full">
                    <div className="relative flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        onLoad={handleImageLoad}
                        className="max-w-[90vw] max-h-[85vh] object-contain"
                        style={{
                          margin: '0 auto'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img
                src={images[0]}
                alt="Single Image"
                onLoad={handleImageLoad}
                className="max-w-[90vw] max-h-[85vh] object-contain"
              />
            </div>
          )}
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-gray-800 bg-opacity-50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSlide;