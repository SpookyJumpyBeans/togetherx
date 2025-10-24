import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emailSchema = z.object({
  email: z.string().trim().email("Valid email is required").max(255, "Email must be less than 255 characters"),
});

export const SubscribeDialog = ({ open, onOpenChange }: SubscribeDialogProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate email
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Invalid email");
      setLoading(false);
      return;
    }

    // For now, just show success - you can add email service integration later
    toast.success("Successfully subscribed to weekly updates!");
    setEmail("");
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Subscribe to Weekly Updates
          </DialogTitle>
          <DialogDescription className="text-base">
            Get notified about new product submissions every week
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubscribe} className="space-y-6 pt-4">
          <div>
            <Label htmlFor="subscribe-email" className="text-sm font-medium mb-2 block">
              Email Address
            </Label>
            <Input
              id="subscribe-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="border-0 border-b-2 border-border/50 rounded-none focus:border-primary transition-colors bg-transparent shadow-none px-0"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full"
            size="lg"
          >
            <Mail className="w-4 h-4 mr-2" />
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
