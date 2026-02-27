
'use client';

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { MOCK_MENTORS, Mentor } from "@/lib/mentors-data";
import MentorCard from "./MentorCard";
import { useRouter } from "next/navigation";

export default function MentorCarousel() {
  const router = useRouter();
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const handleBook = (mentor: Mentor) => {
    router.push(`/career-mentors?mentor=${mentor.id}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {MOCK_MENTORS.map((mentor) => (
            <CarouselItem key={mentor.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1 h-full">
                <MentorCard mentor={mentor} onBook={handleBook} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
