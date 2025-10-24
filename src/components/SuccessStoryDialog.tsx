import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Upload, Trophy } from "lucide-react";

interface SuccessStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessStoryDialog = ({ open, onOpenChange }: SuccessStoryDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    screenshot: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to submit a success story");
      setLoading(false);
      return;
    }

    try {
      // Upload screenshot if provided
      let screenshotUrl = "";
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, formData.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      const { error } = await supabase
        .from('success_stories')
        .insert([{
          user_id: session.user.id,
          title: formData.title,
          story: formData.story,
          screenshot: screenshotUrl,
        }]);

      if (error) throw error;

      toast.success("Success story submitted!", {
        description: "We'll review it and feature it on the landing page.",
      });

      setFormData({ title: "", story: "", screenshot: null });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to submit story", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Share Your Success Story</DialogTitle>
              <DialogDescription className="text-base">
                Inspire others with your partnership journey
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., How we 10x'd our user base through partnerships"
              className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
              required
            />
          </div>

          <div>
            <Label htmlFor="story" className="text-sm font-medium mb-2 block">
              Your Story
            </Label>
            <Textarea
              id="story"
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              placeholder="Share your partnership success story, key milestones, and lessons learned..."
              rows={6}
              className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none resize-none px-0"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Screenshot (Optional)
            </Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })}
              className="hidden"
              id="story-screenshot"
            />
            <label
              htmlFor="story-screenshot"
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border/30 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer bg-muted/10"
            >
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {formData.screenshot ? formData.screenshot.name : "Upload growth chart or metrics"}
                </p>
              </div>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full rounded-full"
          >
            {loading ? "Submitting..." : "Submit Success Story"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
