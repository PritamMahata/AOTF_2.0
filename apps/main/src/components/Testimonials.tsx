import { Star } from "lucide-react";
import { Card, CardContent } from "@aotf/ui/components/card";
import { useEffect, useRef } from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Martin K. Barker",
      role: "Product Manager",
      rating: 5,
      text: "Efficiently repurpose strategic ideas without transparent markets and collaborative ROI platforms.",
      avatar: "👨‍💼",
    },
    {
      name: "Murat K. Barker",
      role: "Marketing Director",
      rating: 5,
      text: "Efficiently repurpose strategic ideas without transparent markets and collaborative ROI platforms.",
      avatar: "👨‍💼",
    },
    {
      name: "Naomi K. Barker",
      role: "Business Owner",
      rating: 5,
      text: "Efficiently repurpose strategic ideas without transparent markets and collaborative ROI platforms.",
      avatar: "👨‍💼",
    },
    {
      name: "Murat K. Barker",
      role: "Creative Director",
      rating: 5,
      text: "Efficiently repurpose strategic ideas without transparent markets and collaborative ROI platforms.",
      avatar: "👨‍💼",
    },
  ];

  // Infinite horizontal auto-scroll
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speed = 0.5; // px per frame for subtle movement

    const step = () => {
      if (!pausedRef.current) {
        container.scrollLeft += speed;
        // Reset halfway to create a seamless loop (content duplicated)
        const half = container.scrollWidth / 2;
        if (container.scrollLeft >= half) {
          container.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h3 className="text-xs font-semibold text-primary/80 mb-2 tracking-wider uppercase">
            Testimonials
          </h3>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            What our clients say
          </h2>
        </div>

        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="overflow-hidden"
        >
          <div className="flex gap-4 w-max">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card
                key={`${testimonial.name}-${index}`}
                className="min-w-[280px] max-w-[320px] bg-background/60 border-border/60 shadow-sm hover:shadow-md transition-all rounded-xl"
              >
                <CardContent className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <h4 className="font-medium text-foreground">We have no regrets!</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
