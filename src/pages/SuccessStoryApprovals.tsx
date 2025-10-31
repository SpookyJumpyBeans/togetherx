import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { EnhancedSubmitDialog } from "@/components/EnhancedSubmitDialog";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { SuccessStoryDetailDialog } from "@/components/SuccessStoryDetailDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SuccessStoryApprovals() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !roleData) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await loadStories();
  };

  const loadStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load success stories");
      console.error(error);
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (storyId: string) => {
    const { error } = await supabase
      .from("success_stories")
      .update({ approval_status: "approved" })
      .eq("id", storyId);

    if (error) {
      toast.error("Failed to approve story");
      console.error(error);
    } else {
      toast.success("Success story approved!");
      await loadStories();
    }
  };

  const handleReject = async (storyId: string) => {
    const { error } = await supabase
      .from("success_stories")
      .update({ approval_status: "rejected" })
      .eq("id", storyId);

    if (error) {
      toast.error("Failed to reject story");
      console.error(error);
    } else {
      toast.success("Success story rejected");
      await loadStories();
    }
  };

  const pendingStories = stories.filter(s => s.approval_status === "pending");
  const approvedStories = stories.filter(s => s.approval_status === "approved");
  const rejectedStories = stories.filter(s => s.approval_status === "rejected");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        onSubmitClick={() => setSubmitDialogOpen(true)}
        onSubscribeClick={() => setSubscribeDialogOpen(true)}
      />

      <main className="container mx-auto px-6 md:px-8 py-16 flex-1 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Success Story Approvals</h1>
          <p className="text-muted-foreground">Review and approve submitted success stories</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingStories.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedStories.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedStories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8">
            {pendingStories.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No pending success stories</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingStories.map((story) => (
                  <Card 
                    key={story.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => {
                      setSelectedStory(story);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      {story.screenshot && (
                        <div className="h-48 md:h-full bg-muted">
                          <img
                            src={story.screenshot}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <CardTitle className="text-2xl">{story.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">{story.story}</p>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(story.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(story.id);
                            }}
                            className="flex-1 bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(story.id);
                            }}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-8">
            {approvedStories.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No approved success stories</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {approvedStories.map((story) => (
                  <Card 
                    key={story.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => {
                      setSelectedStory(story);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      {story.screenshot && (
                        <div className="h-48 md:h-full bg-muted">
                          <img
                            src={story.screenshot}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <CardTitle className="text-2xl">{story.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">{story.story}</p>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(story.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(story.id);
                            }}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Move to Rejected
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-8">
            {rejectedStories.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No rejected success stories</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {rejectedStories.map((story) => (
                  <Card 
                    key={story.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => {
                      setSelectedStory(story);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="grid md:grid-cols-[300px_1fr] gap-6">
                      {story.screenshot && (
                        <div className="h-48 md:h-full bg-muted">
                          <img
                            src={story.screenshot}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <CardTitle className="text-2xl">{story.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-3">{story.story}</p>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {new Date(story.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(story.id);
                            }}
                            className="flex-1 bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Move to Approved
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <EnhancedSubmitDialog 
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
      />
      
      <SubscribeDialog 
        open={subscribeDialogOpen}
        onOpenChange={setSubscribeDialogOpen}
      />

      <SuccessStoryDetailDialog
        story={selectedStory}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
