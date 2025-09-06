import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Upload, X, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price?: number;
  sizes: string[];
  category: string;
  image_urls: string[];
  is_featured: boolean;
  description?: string;
  color?: string;
  fabric?: string;
}

interface Category {
  id: string;
  name: string;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    color: "",
    fabric: "",
    sizes: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      color: "",
      fabric: "",
      sizes: "",
      is_featured: false,
    });
    setEditingProduct(null);
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price?.toString() || "",
      description: product.description || "",
      category: product.category,
      color: product.color || "",
      fabric: product.fabric || "",
      sizes: product.sizes?.join(", ") || "",
      is_featured: product.is_featured || false,
    });
    setEditingProduct(product);
    setSelectedImages([]);
    setIsDialogOpen(true);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }
    } catch (error: any) {
      toast({
        title: "Error uploading images",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sizesArray = formData.sizes ? formData.sizes.split(",").map(s => s.trim()).filter(s => s) : [];
      const price = formData.price ? parseFloat(formData.price) : null;

      // Upload new images
      const newImageUrls = await uploadImages();
      
      // Combine existing images (if editing) with new uploaded images
      const existingImageUrls = editingProduct?.image_urls || [];
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      const productData = {
        name: formData.name,
        price,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        fabric: formData.fabric,
        sizes: sizesArray,
        is_featured: formData.is_featured,
        image_urls: allImageUrls,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product deleted successfully",
        });

        fetchData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-elegant text-primary">Product Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fabric">Fabric</Label>
                      <Input
                        id="fabric"
                        value={formData.fabric}
                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sizes">Available Sizes (comma-separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      placeholder="XS, S, M, L, XL"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label>Featured Product</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Product Images</Label>
                    <div className="space-y-4">
                      <Input
                        ref={fileInputRef}
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      
                      {selectedImages.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Selected Images:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedImages.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                                  <span className="text-sm truncate">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {editingProduct?.image_urls && editingProduct.image_urls.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Existing Images:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {editingProduct.image_urls.map((url, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={url} 
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || uploading}>
                    {(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploading ? "Uploading Images..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{products.filter(p => p.is_featured).length}</div>
              <div className="text-sm text-muted-foreground">Featured Products</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{products.filter(p => p.price && p.price > 0).length}</div>
              <div className="text-sm text-muted-foreground">Priced Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-elegant text-primary mb-2">No Products Yet</h3>
              <p className="text-muted-foreground">Start building your catalogue by adding your first product.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  onEdit={handleEdit}
                  isAdmin={true}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;