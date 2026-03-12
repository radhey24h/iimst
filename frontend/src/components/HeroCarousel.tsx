'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Transform Your Career with Professional Education',
    subtitle: 'Industry-aligned MBA, PGDM & Diploma programs for working professionals',
    description: 'Flexible learning options designed to fit your schedule while advancing your career goals.',
    cta: { text: 'Explore Programs', link: '/courses' },
    ctaSecondary: { text: 'Student Login', link: '/login' },
    bgGradient: 'from-blue-900 via-blue-800 to-indigo-900',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
  },
  {
    id: 2,
    title: 'MBA & PGDM Programs',
    subtitle: 'Accelerate your management career with advanced qualifications',
    description: 'Comprehensive curriculum covering finance, marketing, HR, operations and strategic management.',
    cta: { text: 'View MBA Programs', link: '/courses#management' },
    ctaSecondary: { text: 'Contact Us', link: '/contact' },
    bgGradient: 'from-purple-900 via-purple-800 to-pink-900',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Flexible Distance Learning',
    subtitle: 'Study at your own pace, anywhere, anytime',
    description: 'Balance your work and studies with our flexible distance education programs and online support.',
    cta: { text: 'Learn More', link: '/courses' },
    ctaSecondary: { text: 'Admission Info', link: '/contact' },
    bgGradient: 'from-teal-900 via-teal-800 to-cyan-900',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
  },
  {
    id: 4,
    title: 'Skill-Based Diploma Programs',
    subtitle: 'Short-term diplomas for rapid skill development',
    description: 'Six-month and one-year programs in management, IT, technical and professional streams.',
    cta: { text: 'Browse Diplomas', link: '/courses#diploma' },
    ctaSecondary: { text: 'Get Started', link: '/contact' },
    bgGradient: 'from-orange-900 via-red-800 to-pink-900',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80',
  },
  {
    id: 5,
    title: 'Digital Student Portal',
    subtitle: 'Your academic journey, all in one place',
    description: 'Access your digital ID card, exam results, online tests and study materials from anywhere.',
    cta: { text: 'Portal Login', link: '/login' },
    ctaSecondary: { text: 'Learn More', link: '/about' },
    bgGradient: 'from-gray-900 via-slate-800 to-blue-900',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1920&q=80',
  },
  {
    id: 6,
    title: '15+ Years of Educational Excellence',
    subtitle: 'Trusted by over 2,000 students across India',
    description: 'Dedicated to empowering professionals with quality education and skill development.',
    cta: { text: 'Our Story', link: '/about' },
    ctaSecondary: { text: 'View Courses', link: '/courses' },
    bgGradient: 'from-emerald-900 via-green-800 to-teal-900',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80',
  },
  {
    id: 7,
    title: 'Professional Certification Programs',
    subtitle: 'Upskill with industry-recognized certifications',
    description: 'Enhance your expertise with specialized programs in business, technology and management.',
    cta: { text: 'View Certifications', link: '/courses' },
    ctaSecondary: { text: 'Enquire Now', link: '/contact' },
    bgGradient: 'from-rose-900 via-red-800 to-orange-900',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80',
  },
  {
    id: 8,
    title: 'Admissions Open 2025-26',
    subtitle: 'Enroll now for the upcoming academic session',
    description: 'Limited seats available. Start your journey towards professional excellence today.',
    cta: { text: 'Apply Now', link: '/contact' },
    ctaSecondary: { text: 'Course Catalog', link: '/courses' },
    bgGradient: 'from-violet-900 via-purple-800 to-fuchsia-900',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative w-full h-[420px] md:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
          </div>

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 max-w-7xl h-full flex items-center">
            <div className="max-w-3xl">
              <h2 className="text-lg md:text-xl font-semibold text-orange-300 mb-2 animate-fade-in">
                {slide.subtitle}
              </h2>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight animate-slide-up">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base text-gray-200 mb-6 max-w-2xl animate-fade-in-delayed">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-3 animate-fade-in-more-delayed">
                <Link
                  href={slide.cta.link}
                  className="bg-iimst-orange hover:bg-iimst-orange-dark text-white px-6 py-2.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  {slide.cta.text}
                </Link>
                <Link
                  href={slide.ctaSecondary.link}
                  className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 hover:border-white/60 px-6 py-2.5 rounded-md font-semibold transition-all backdrop-blur-sm text-sm md:text-base"
                >
                  {slide.ctaSecondary.text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'bg-iimst-orange w-12 h-3'
                : 'bg-white/50 hover:bg-white/80 w-3 h-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-30 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        {currentSlide + 1} / {slides.length}
      </div>
    </section>
  );
}
