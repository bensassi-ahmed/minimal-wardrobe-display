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
            Élégance
            <br />
            <span className="text-accent">Intemporelle</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Découvrez notre collection soigneusement sélectionnée de pièces de mode minimaliste, 
            conçues pour l'individu moderne qui valorise la qualité et le style.
          </p>
          <Link to="/catalogue">
            <Button size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              Explorer la Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-8 text-foreground">
            Notre Philosophie
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Chez Atelier, nous croyons que le vrai style transcende les tendances. Nos pièces soigneusement 
            sélectionnées sont conçues pour être chéries pendant des années, alliant un savoir-faire exceptionnel 
            à une esthétique intemporelle. Chaque vêtement raconte une histoire de qualité, de durabilité 
            et d'attention aux détails sans compromis.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Savoir-faire de Qualité</h3>
              <p className="text-muted-foreground">Chaque pièce est méticuleusement conçue avec une attention aux détails et des matériaux premium.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Design Durable</h3>
              <p className="text-muted-foreground">Nous privilégions les matériaux écologiques et les pratiques de production éthiques.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">Style Intemporel</h3>
              <p className="text-muted-foreground">Des designs classiques qui restent pertinents saison après saison.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-bold mb-6 text-foreground">
            Prêt à découvrir votre style ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Parcourez notre collection complète et trouvez des pièces qui parlent à votre esthétique personnelle.
          </p>
          <Link to="/catalogue">
            <Button size="lg" className="text-lg px-8 py-6">
              Voir le Catalogue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}