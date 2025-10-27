import { useState, useEffect } from "react";
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
  editingStory?: {
    id: string;
    title: string;
    story: string;
    screenshot: string;
  } | null;
  onSuccess?: () => void;
}

export const SuccessStoryDialog = ({ open, onOpenChange, editingStory, onSuccess }: SuccessStoryDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    screenshot: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  // Update form when editingStory changes
  useEffect(() => {
    if (editingStory) {
      setFormData({
        title: editingStory.title,
        story: editingStory.story,
        screenshot: null,
      });
    } else {
      setFormData({ title: "", story: "", screenshot: null });
    }
  }, [editingStory]);

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
      let screenshotUrl = editingStory?.screenshot || "";
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

      if (editingStory) {
        // Update existing story
        const { data, error } = await supabase
          .from('success_stories')
          .update({
            title: formData.title,
            story: formData.story,
            screenshot: screenshotUrl,
          })
          .eq('id', editingStory.id)
          .eq('user_id', session.user.id)
          .select();

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        console.log("Update successful:", data);
        toast.success("Success story updated!");
        
        // Reset form
        setFormData({ title: "", story: "", screenshot: null });
        
        // Call onSuccess to reload data BEFORE closing dialog
        await onSuccess?.();
        
        // Close dialog after reload
        onOpenChange(false);
      } else {
        // Insert new story
        const { data, error } = await supabase
          .from('success_stories')
          .insert([{
            user_id: session.user.id,
            title: formData.title,
            story: formData.story,
            screenshot: screenshotUrl,
          }])
          .select();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        console.log("Insert successful:", data);
        toast.success("Success story added!");
        
        // Reset form
        setFormData({ title: "", story: "", screenshot: null });
        
        // Call onSuccess to reload data BEFORE closing dialog
        await onSuccess?.();
        
        // Close dialog after reload
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Story save error:", error);
      toast.error(editingStory ? "Failed to update story" : "Failed to add story", { 
        description: error.message 
      });
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
              <DialogTitle className="text-2xl font-bold">
                {editingStory ? "Edit Success Story" : "Share Your Success Story"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingStory ? "Update your success story" : "Inspire others with your partnership journey"}
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
            {loading ? (editingStory ? "Updating..." : "Submitting...") : (editingStory ? "Update Success Story" : "Submit Success Story")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
