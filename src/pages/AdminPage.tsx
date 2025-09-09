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
import { Badge } from "@/components/ui/badge";
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

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_name: string;
  slug: string;
  featured_image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
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

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  const [blogFormData, setBlogFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author_name: "Admin",
    slug: "",
    featured_image_url: "",
    is_published: false,
  });

  const [selectedBlogImage, setSelectedBlogImage] = useState<File | null>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult, blogPostsResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (blogPostsResult.error) throw blogPostsResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setBlogPosts(blogPostsResult.data || []);
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

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      slug: "",
    });
    setEditingCategory(null);
  };

  const handleCategoryEdit = (category: Category) => {
    setCategoryFormData({
      name: category.name,
      description: (category as any).description || "",
      slug: (category as any).slug || "",
    });
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/\s+/g, '-');
      
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        slug,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setIsCategoryDialogOpen(false);
      resetCategoryForm();
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

  const handleCategoryDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? Products using this category will need to be updated.")) {
      try {
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category deleted successfully",
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

  // Blog Management Functions
  const resetBlogForm = () => {
    setBlogFormData({
      title: "",
      content: "",
      excerpt: "",
      author_name: "Admin",
      slug: "",
      featured_image_url: "",
      is_published: false,
    });
    setEditingBlogPost(null);
    setSelectedBlogImage(null);
    if (blogFileInputRef.current) {
      blogFileInputRef.current.value = '';
    }
    setIsBlogDialogOpen(false);
  };

  const uploadBlogImage = async (): Promise<string | null> => {
    if (!selectedBlogImage) return null;

    setUploading(true);
    try {
      const fileExt = selectedBlogImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, selectedBlogImage);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Erreur upload image",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleBlogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedBlogImage(e.target.files[0]);
    }
  };

  const handleBlogEdit = (blogPost: BlogPost) => {
    setBlogFormData({
      title: blogPost.title,
      content: blogPost.content,
      excerpt: blogPost.excerpt || "",
      author_name: blogPost.author_name,
      slug: blogPost.slug,
      featured_image_url: blogPost.featured_image_url || "",
      is_published: blogPost.is_published,
    });
    setEditingBlogPost(blogPost);
    setIsBlogDialogOpen(true);
  };

  const createBlogSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = blogFormData.slug || createBlogSlug(blogFormData.title);
      
      // Upload new image if selected
      const uploadedImageUrl = await uploadBlogImage();
      const imageUrl = uploadedImageUrl || blogFormData.featured_image_url || null;
      
      const blogData = {
        title: blogFormData.title,
        content: blogFormData.content,
        excerpt: blogFormData.excerpt || null,
        author_name: blogFormData.author_name,
        slug: slug,
        featured_image_url: imageUrl,
        is_published: blogFormData.is_published,
      };

      let result;
      if (editingBlogPost) {
        result = await supabase
          .from("blog_posts")
          .update(blogData)
          .eq("id", editingBlogPost.id)
          .select();
      } else {
        result = await supabase
          .from("blog_posts")
          .insert([blogData])
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: "Succès",
        description: `Article ${editingBlogPost ? "mis à jour" : "créé"} avec succès`,
      });

      resetBlogForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlogDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article de blog ?")) {
      try {
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Article supprimé avec succès",
        });

        fetchData();
      } catch (error: any) {
        toast({
          title: "Erreur",
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
          <h1 className="text-3xl font-elegant text-primary">Admin Dashboard</h1>
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

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Management */}
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Product Management</span>
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
                      {/* ... keep existing product form code */}
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{products.length}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </CardContent>
          </Card>

          {/* Category Management */}
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Category Management</span>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetCategoryForm(); setIsCategoryDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Edit Category" : "Add New Category"}
                      </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name *</Label>
                        <Input
                          id="categoryName"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categorySlug">Slug</Label>
                        <Input
                          id="categorySlug"
                          value={categoryFormData.slug}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                          placeholder="Auto-generated from name if empty"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Textarea
                          id="categoryDescription"
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingCategory ? "Update Category" : "Add Category"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-primary mb-2">{categories.length}</div>
              <div className="text-sm text-muted-foreground mb-4">Total Categories</div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryEdit(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryDelete(category.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blog Management */}
          <Card className="bg-card/50 backdrop-blur border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gestion du Blog</span>
                <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetBlogForm(); setIsBlogDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingBlogPost ? "Modifier l'Article" : "Nouvel Article"}
                      </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="blogTitle">Titre *</Label>
                        <Input
                          id="blogTitle"
                          value={blogFormData.title}
                          onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blogSlug">Slug URL</Label>
                        <Input
                          id="blogSlug"
                          value={blogFormData.slug}
                          onChange={(e) => setBlogFormData({ ...blogFormData, slug: e.target.value })}
                          placeholder="Laissez vide pour génération automatique"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blogExcerpt">Résumé</Label>
                        <Textarea
                          id="blogExcerpt"
                          value={blogFormData.excerpt}
                          onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                          placeholder="Bref aperçu de l'article..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blogContent">Contenu *</Label>
                        <Textarea
                          id="blogContent"
                          value={blogFormData.content}
                          onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                          placeholder="Contenu complet de l'article..."
                          rows={10}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blogAuthor">Auteur</Label>
                        <Input
                          id="blogAuthor"
                          value={blogFormData.author_name}
                          onChange={(e) => setBlogFormData({ ...blogFormData, author_name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="blogImage">Image à la une</Label>
                        <div className="space-y-4">
                          <Input
                            ref={blogFileInputRef}
                            id="blogImage"
                            type="file"
                            accept="image/*"
                            onChange={handleBlogFileChange}
                            className="cursor-pointer"
                          />
                          
                          {selectedBlogImage && (
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Image sélectionnée:</Label>
                              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <span className="text-sm truncate">{selectedBlogImage.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedBlogImage(null)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {editingBlogPost?.featured_image_url && !selectedBlogImage && (
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Image actuelle:</Label>
                              <div className="relative">
                                <img 
                                  src={editingBlogPost.featured_image_url} 
                                  alt="Image actuelle"
                                  className="w-full h-32 object-cover rounded-md"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="blogImageUrl">Ou URL de l'image</Label>
                            <Input
                              id="blogImageUrl"
                              value={blogFormData.featured_image_url}
                              onChange={(e) => setBlogFormData({ ...blogFormData, featured_image_url: e.target.value })}
                              placeholder="https://exemple.com/image.jpg"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="blogPublished"
                          checked={blogFormData.is_published}
                          onCheckedChange={(checked) => setBlogFormData({ ...blogFormData, is_published: checked })}
                        />
                        <Label htmlFor="blogPublished">Publier l'article</Label>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingBlogPost ? "Mettre à Jour" : "Créer l'Article"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{blogPosts.length}</div>
              <div className="text-sm text-muted-foreground mb-4">
                Total Articles • {blogPosts.filter(p => p.is_published).length} Publiés
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {blogPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun article créé</p>
                ) : (
                  blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{post.title}</p>
                          {post.is_published && <Badge variant="secondary" className="text-xs">Publié</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Par {post.author_name} • {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlogEdit(post)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlogDelete(post.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
              <div className="text-2xl font-bold text-primary">{blogPosts.length}</div>
              <div className="text-sm text-muted-foreground">Articles de Blog</div>
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