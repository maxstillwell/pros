"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroSlide = {
  alt: string;
  src: string;
};

type HeroSlideshowProps = {
  slides: HeroSlide[];
};

export function HeroSlideshow({ slides }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="absolute inset-0">
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={index === activeIndex ? slide.alt : ""}
          fill
          priority={index === 0}
          unoptimized
          sizes="100vw"
          aria-hidden={index === activeIndex ? undefined : true}
          className={`object-cover transition-[opacity,transform] duration-[1800ms] ease-in-out ${
            index === activeIndex
              ? "scale-100 opacity-100"
              : "scale-[1.03] opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
