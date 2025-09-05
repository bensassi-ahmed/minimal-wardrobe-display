import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { useState } from "react";

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

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  isAdmin?: boolean;
}

export default function ProductCard({ product, onView, onEdit, isAdmin = false }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const primaryImage = product.image_urls?.[0];
  const hasPrice = product.price && product.price > 0;

  return (
    <Card className="group overflow-hidden border-0 shadow-soft hover:shadow-card transition-all duration-300 bg-gradient-card">
      <div className="aspect-[3/4] relative overflow-hidden">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No image</div>
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onView?.(product)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(product)}
                className="bg-white/90 hover:bg-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Featured badge */}
        {product.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
          {hasPrice && (
            <span className="font-medium text-primary">${product.price}</span>
          )}
        </div>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}

        <div className="flex flex-wrap gap-1 pt-2">
          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
          {product.color && (
            <Badge variant="outline" className="text-xs">{product.color}</Badge>
          )}
          {product.fabric && (
            <Badge variant="outline" className="text-xs">{product.fabric}</Badge>
          )}
        </div>

        {product.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-xs text-muted-foreground">Sizes:</span>
            {product.sizes.map((size) => (
              <span key={size} className="text-xs text-muted-foreground">{size}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}