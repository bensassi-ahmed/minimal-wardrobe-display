import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sizes: string[];
  category: string;
  color?: string;
  fabric?: string;
  image_urls: string[];
  is_featured: boolean;
}

export default function ProductDetailPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) return;
      
      try {
        // Convert slug back to product name (replace hyphens with spaces)
        const productName = productSlug.replace(/-/g, ' ');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', productName)
          .single();

        if (error) throw error;
        
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Erreur",
          description: "Produit introuvable.",
          variant: "destructive",
        });
        navigate('/catalogue');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, navigate, toast]);

  const nextImage = () => {
    if (!product || product.image_urls.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.image_urls.length);
  };

  const prevImage = () => {
    if (!product || product.image_urls.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.image_urls.length) % product.image_urls.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Chargement du produit...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentImage = product.image_urls?.[currentImageIndex];
  const hasMultipleImages = product.image_urls && product.image_urls.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/catalogue')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au Catalogue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {currentImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Zoom button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setZoomOpen(true)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  {/* Navigation arrows */}
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-muted-foreground">Aucune image disponible</div>
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            {hasMultipleImages && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                {product.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Vedette
                  </Badge>
                )}
              </div>
              
              {product.price && product.price > 0 && (
                <div className="text-2xl font-bold text-primary mb-4">
                  {product.price}€
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Catégorie</h4>
                <Badge variant="secondary">{product.category}</Badge>
              </div>

              {product.color && (
                <div>
                  <h4 className="font-semibold mb-2">Couleur</h4>
                  <Badge variant="outline">{product.color}</Badge>
                </div>
              )}

              {product.fabric && (
                <div>
                  <h4 className="font-semibold mb-2">Tissu</h4>
                  <Badge variant="outline">{product.fabric}</Badge>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tailles Disponibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Badge key={size} variant="outline" className="text-sm">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="relative w-full h-full">
            {currentImage && (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            )}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}