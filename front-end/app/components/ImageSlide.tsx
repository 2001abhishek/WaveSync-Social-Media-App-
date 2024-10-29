import { useState } from "react";
import Slider from "react-slick";

interface ImageSlideProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ images, isOpen, onClose }) => {
  if (!isOpen || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Custom Arrow Components
  const PrevArrow = (props: any) => (
    <div
      {...props}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 rounded-full p-2 cursor-pointer z-10"
    >
      &#10094;
    </div>
  );

  const NextArrow = (props: any) => (
    <div
      {...props}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 rounded-full p-2 cursor-pointer z-10"
    >
      &#10095;
    </div>
  );

  // Slider settings with afterChange to update currentIndex
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    afterChange: (index: number) => setCurrentIndex(index), // Update current index on slide change
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative w-full max-w-3xl mx-auto">
        {/* Close button */}
        <div
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl cursor-pointer z-20"
          style={{ zIndex: 20 }}
        >
          &times;
        </div>

        {/* Image Slider */}
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
          ))}
        </Slider>

        {/* Image Counter */}
        <div className="text-center text-white mt-2 z-10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageSlide;
