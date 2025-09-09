import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

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
      {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
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

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-8">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative group cursor-pointer">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-elegant"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <ZoomIn className="h-6 w-6 text-foreground" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-contain"
                  />
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