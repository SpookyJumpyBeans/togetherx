import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Globe, Calendar, ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";

export interface DbProduct {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  website_link?: string;
  contact_email?: string;
  created_at?: string;
  screenshot_url?: string;
  screenshot_urls?: string[];
  logo_url?: string;
  target_audience?: string;
  category?: string;
  tags?: string;
  uses_ai?: boolean;
  tech_highlights?: string;
  users?: string;
  revenue?: string;
  growth_rate?: string;
  users_screenshot_url?: string;
  revenue_screenshot_url?: string;
  growth_screenshot_url?: string;
  partnership?: boolean;
  co_marketing?: boolean;
  white_label?: boolean;
  reseller?: boolean;
  acquisition?: boolean;
  acquisition_details?: string;
}

interface DbProductDetailDialogProps {
  product: DbProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showProof?: boolean;
}

export const DbProductDetailDialog = ({ product, open, onOpenChange, showProof = false }: DbProductDetailDialogProps) => {
  const [user, setUser] = useState<any>(null);
  const [contacting, setContacting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  
  const contactSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    company: z.string().trim().max(100, "Company must be less than 100 characters"),
    message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  });

  // Get all available images
  const images = product?.screenshot_urls && product.screenshot_urls.length > 0 
    ? product.screenshot_urls 
    : product?.screenshot_url 
    ? [product.screenshot_url] 
    : ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop"];

  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Please sign in to contact founders");
      return;
    }

    if (!product) return;

    // Don't allow product owner to contact their own product
    if (product.user_id && user.id === product.user_id) {
      toast.error("You cannot contact your own product");
      return;
    }

    // Validate form
    try {
      contactSchema.parse(contactForm);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return;
    }

    setContacting(true);

    try {
      // Track the contact in the database
      const { error } = await supabase
        .from('product_contacts')
        .insert([{
          product_id: product.id,
          user_id: user.id,
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.info("You've already contacted this founder this month");
        } else {
          throw error;
        }
      } else {
        toast.success("Contact request sent!");
      }

      // Open email client with pre-filled message
      if (product.contact_email) {
        const subject = encodeURIComponent(`Partnership Inquiry for ${product.name}`);
        const body = encodeURIComponent(
          `Hi,\n\nMy name is ${contactForm.name} from ${contactForm.company}.\n\n${contactForm.message}\n\nBest regards,\n${contactForm.name}\n${contactForm.email}`
        );
        window.location.href = `mailto:${product.contact_email}?subject=${subject}&body=${body}`;
      }

      // Reset form
      setContactForm({ name: "", email: "", company: "", message: "" });
    } catch (error: any) {
      console.error("Contact tracking error:", error);
      toast.error("Failed to send message");
    } finally {
      setContacting(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Reset image index when dialog opens/closes or product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [open, product?.id]);

  if (!product) return null;

  const partnershipTypes = [
    { key: 'partnership', label: 'General Partnership', value: product?.partnership },
    { key: 'co_marketing', label: 'Co-marketing', value: product?.co_marketing },
    { key: 'white_label', label: 'White Label', value: product?.white_label },
    { key: 'reseller', label: 'Reseller', value: product?.reseller },
    { key: 'acquisition', label: 'Acquisition', value: product?.acquisition },
  ].filter(type => type.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden border-0 shadow-2xl p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left side - Product Details */}
          <div className="flex-1 overflow-y-auto p-8">
            <DialogHeader className="sr-only">
              <DialogTitle>Product Details</DialogTitle>
              <DialogDescription>View product information and contact the founder</DialogDescription>
            </DialogHeader>
            <div className="space-y-8">
              {/* Screenshot with Carousel */}
              <div className="w-full h-64 bg-muted rounded-xl overflow-hidden relative">
                <img
                  src={images[currentImageIndex]}
                  alt={`${product?.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <Button
                      onClick={handlePrevImage}
                      size="sm"
                      variant="secondary"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleNextImage}
                      size="sm"
                      variant="secondary"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? "bg-background w-6" : "bg-background/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Header with Logo */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={product?.logo_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop"}
                      alt={`${product?.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-3xl font-bold">{product?.name}</h2>
                      {product?.uses_ai && (
                        <Badge variant="secondary">Uses AI</Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-base">
                      {product?.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Category</h3>
                  <p className="font-semibold">{product?.category || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Target Audience</h3>
                  <p className="font-semibold">{product?.target_audience || "Not specified"}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
                {product?.tags ? (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(',').map((tag, i) => (
                      <Badge key={i} variant="outline">{tag.trim()}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold">Not specified</p>
                )}
              </div>

              {/* Tech Highlights */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Technology Stack</h3>
                </div>
                <p className="font-semibold">{product?.tech_highlights || "Not specified"}</p>
              </div>

              {/* Traction Metrics - Always shown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Traction</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Users/DAU/MAU</p>
                    <p className="font-semibold">{product?.users || "Not disclosed"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-semibold">{product?.revenue || "Not disclosed"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                    <p className="font-semibold">{product?.growth_rate || "Not disclosed"}</p>
                  </div>
                </div>
                
                {/* Traction Proof Screenshots - Only shown when showProof is true */}
                {showProof && (product?.users_screenshot_url || product?.revenue_screenshot_url || product?.growth_screenshot_url) && (
                  <div className="space-y-3 pt-3 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground">Traction Proof</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {product.users_screenshot_url && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Users Proof</p>
                          <img 
                            src={product.users_screenshot_url} 
                            alt="Users proof" 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      {product.revenue_screenshot_url && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Revenue Proof</p>
                          <img 
                            src={product.revenue_screenshot_url} 
                            alt="Revenue proof" 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      {product.growth_screenshot_url && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Growth Proof</p>
                          <img 
                            src={product.growth_screenshot_url} 
                            alt="Growth proof" 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Partnership Types - Always shown */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Partnership Interests</h3>
                {partnershipTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {partnershipTypes.map((type) => (
                      <Badge key={type.key}>{type.label}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold">Not specified</p>
                )}
              </div>

              {/* Acquisition Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Acquisition Details</h3>
                <p className="font-semibold">{product?.acquisition_details || "Not specified"}</p>
              </div>

              {/* Website Link */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Website</h3>
                {product?.website_link ? (
                  <a
                    href={product.website_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline font-semibold"
                  >
                    <Globe className="w-4 h-4" />
                    {product.website_link}
                  </a>
                ) : (
                  <p className="font-semibold">Not provided</p>
                )}
              </div>

              {/* Created Date */}
              {product?.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Listed on {new Date(product.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="w-full lg:w-[400px] bg-muted/30 p-8 border-l overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Get in Touch</h2>
                <p className="text-sm text-muted-foreground">
                  Interested in partnering? Send a message
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm font-medium">
                    Your Name *
                  </Label>
                  <Input
                    id="contact-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="John Doe"
                    maxLength={100}
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Your Email *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="john@company.com"
                    maxLength={255}
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-company" className="text-sm font-medium">
                    Your Company
                  </Label>
                  <Input
                    id="contact-company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    placeholder="Acme Inc."
                    maxLength={100}
                    className="rounded-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell them why you'd like to partner..."
                    maxLength={1000}
                    className="min-h-[120px] resize-none rounded-2xl"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={contacting || !user}
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {contacting ? "Sending..." : "Send Message"}
                </Button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please sign in to send messages
                  </p>
                )}
                
                {user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Your contact will be tracked for leaderboard rankings
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
