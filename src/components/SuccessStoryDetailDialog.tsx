import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

interface SuccessStoryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: {
    id: string;
    title: string;
    story: string;
    screenshot: string;
  } | null;
}

export const SuccessStoryDetailDialog = ({ open, onOpenChange, story }: SuccessStoryDetailDialogProps) => {
  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold">{story.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {story.screenshot && (
            <img 
              src={story.screenshot} 
              alt={story.title}
              className="w-full rounded-lg object-cover"
            />
          )}
          
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{story.story}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
