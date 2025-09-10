import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Instagram, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Envoyé !",
      description: "Merci pour votre message. Nous vous répondrons bientôt.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Contactez-nous
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vous avez des questions sur notre collection ? Nous serions ravis de vous entendre.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">hello@atelier.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Instagram className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Instagram</h3>
                      <p className="text-muted-foreground">@fa.li.fashion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Facebook className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Facebook</h3>
                      <p className="text-muted-foreground">FA.LI Fashion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.463-1.95 4.515-1.135 1.134-2.865 1.907-4.865 1.907-1.347 0-2.513-.444-3.277-1.207-.765-.764-1.207-1.93-1.207-3.277 0-2.026.793-3.73 1.97-4.908.684-.684 1.552-1.025 2.412-1.025.86 0 1.728.341 2.412 1.025.627.628.982 1.472.982 2.412 0 .94-.355 1.784-.982 2.412-.627.627-1.472.982-2.412.982-.628 0-1.207-.25-1.619-.662-.412-.413-.662-.992-.662-1.62 0-.411.167-.784.436-1.053.27-.269.642-.436 1.053-.436.206 0 .394.042.555.118.161.077.289.187.378.318.089.131.134.28.134.436 0 .235-.095.448-.263.616-.168.168-.381.263-.616.263-.078 0-.153-.012-.224-.035-.071-.024-.137-.059-.195-.105-.058-.046-.105-.102-.138-.166-.033-.064-.05-.135-.05-.209 0-.074.017-.145.05-.209.033-.064.08-.12.138-.166.058-.046.124-.081.195-.105.071-.023.146-.035.224-.035.235 0 .448.095.616.263.168.168.263.381.263.616 0 .156-.045.305-.134.436-.089.131-.217.241-.378.318-.161.076-.349.118-.555.118-.411 0-.783-.167-1.053-.436-.269-.269-.436-.642-.436-1.053 0-.628.25-1.207.662-1.62.412-.412.991-.662 1.619-.662.94 0 1.785.355 2.412.982.627.628.982 1.472.982 2.412 0 .94-.355 1.784-.982 2.412-.628.627-1.472.982-2.412.982-.86 0-1.728-.341-2.412-1.025C6.562 11.983 5.77 10.279 5.77 8.253c0-1.347.442-2.513 1.207-3.277.764-.765 1.93-1.207 3.277-1.207 2 0 3.73.773 4.865 1.907 1.054 1.052 1.781 2.657 1.95 4.515l-.001-.031z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Pinterest</h3>
                      <p className="text-muted-foreground">@falifashion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Envoyez-nous un message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nom *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Comment pouvons-nous vous aider ?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Parlez-nous de votre demande..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Envoi..." : "Envoyer le Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}