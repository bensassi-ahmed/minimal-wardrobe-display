import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-image.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Atelier Fashion Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Timeless
            <br />
            <span className="text-accent">Elegance</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Discover our curated collection of minimalist fashion pieces, 
            crafted for the modern individual who values quality and style.
          </p>
          <Link to="/catalogue">
            <Button size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-8 text-foreground">
            Our Philosophy
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            At Atelier, we believe that true style transcends trends. Our carefully curated pieces 
            are designed to be cherished for years, combining exceptional craftsmanship with 
            timeless aesthetics. Each garment tells a story of quality, sustainability, and 
            uncompromising attention to detail.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Quality Craftsmanship</h3>
              <p className="text-muted-foreground">Every piece is meticulously crafted with attention to detail and premium materials.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Sustainable Design</h3>
              <p className="text-muted-foreground">We prioritize eco-friendly materials and ethical production practices.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Timeless Style</h3>
              <p className="text-muted-foreground">Classic designs that remain relevant season after season.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-bold mb-6 text-foreground">
            Ready to discover your style?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our complete collection and find pieces that speak to your personal aesthetic.
          </p>
          <Link to="/catalogue">
            <Button size="lg" className="text-lg px-8 py-6">
              View Catalogue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}