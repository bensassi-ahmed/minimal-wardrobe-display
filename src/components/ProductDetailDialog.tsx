import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const hasMultipleImages = product.image_urls.length > 1;
  const hasPrice = product.price && product.price > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.image_urls.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-elegant text-primary">
            {product.name}
            {product.is_featured && (
              <Badge className="ml-3 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            {product.image_urls.length > 0 ? (
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.image_urls[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {hasMultipleImages && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                    {product.image_urls.map((url, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {hasPrice && (
              <div className="text-3xl font-bold text-primary">
                ${product.price?.toFixed(2)}
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Product Attributes */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Category</div>
                    <Badge variant="secondary">{product.category}</Badge>
                  </CardContent>
                </Card>

                {product.color && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Color</div>
                      <Badge variant="outline">{product.color}</Badge>
                    </CardContent>
                  </Card>
                )}

                {product.fabric && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Fabric</div>
                      <Badge variant="outline">{product.fabric}</Badge>
                    </CardContent>
                  </Card>
                )}

                {product.sizes?.length > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Available Sizes</div>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map((size) => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}