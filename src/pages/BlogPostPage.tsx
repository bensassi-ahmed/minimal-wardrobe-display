import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_name: string;
  slug: string;
  image_urls?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  const nextImage = () => {
    if (post?.image_urls) {
      setCurrentImageIndex((prev) => (prev + 1) % post.image_urls!.length);
    }
  };

  const prevImage = () => {
    if (post?.image_urls) {
      setCurrentImageIndex((prev) => (prev - 1 + post.image_urls!.length) % post.image_urls!.length);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setNotFound(true);
          } else {
            throw error;
          }
        } else {
          setPost(data);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Erreur",
          description: "Échec du chargement de l'article. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        return (
          <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        );
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Chargement de l'article...</div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              L'article que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
            <Link to="/participation">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{post.title} - Participation & Événements</title>
      <meta name="description" content={post.excerpt || post.content.substring(0, 160)} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || post.content.substring(0, 160)} />
      {post.image_urls && post.image_urls.length > 0 && <meta property="og:image" content={post.image_urls[0]} />}
      <meta property="og:type" content="article" />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link to="/participation">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux articles
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
            </div>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mb-8">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <img
                      src={post.image_urls[0]}
                      alt={post.title}
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-elegant"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-6 w-6 text-foreground" />
                      </div>
                    </div>
                    {post.image_urls.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        +{post.image_urls.length - 1} image{post.image_urls.length > 2 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <div className="relative">
                    <img
                      src={post.image_urls[currentImageIndex]}
                      alt={post.title}
                      className="w-full h-full object-contain"
                    />
                    {post.image_urls.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {post.image_urls.length}
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Article Content */}
          <main className="max-w-none">
            <div className="space-y-4 text-foreground leading-relaxed">
              {formatContent(post.content)}
            </div>
          </main>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold mb-4">
                Découvrez nos autres participations
              </h2>
              <p className="text-muted-foreground mb-6">
                Explorez nos autres événements et initiatives durables
              </p>
              <Link to="/participation">
                <Button>
                  Voir tous les articles
                </Button>
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}