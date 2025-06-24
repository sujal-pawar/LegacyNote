import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EmotionalCarousel = ({ stories }) => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector('.carousel-card');
    if (!card) return;
    const cardWidth = card.offsetWidth + 16; // Including gap
    container.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Emotional Deliveries
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real stories of messages that bridged time and touched hearts.
          </p>
        </div>

        <div className="relative">
          {/* Carousel container */}
          <div
            ref={containerRef}
            className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {stories.map((story, index) => (
              <div
                key={index}
                className="carousel-card snap-center flex-shrink-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <img src={story.src} alt={story.alt} className="w-full h-80 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-xl font-semibold text-white">{story.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{story.quote}</p>
                  <p className="font-semibold text-indigo-600">{story.author}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute sm:top-1/2 max-sm:bottom-2 left-2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-200/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-400 transition"
            aria-label="Scroll Left"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute sm:top-1/2 max-sm:bottom-2 right-2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-200/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-400 transition"
            aria-label="Scroll Right"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EmotionalCarousel;
