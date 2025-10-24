import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TractionLeaderboard } from "@/components/TractionLeaderboard";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";

export default function Leaderboard() {
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSubscribeClick={() => setSubscribeDialogOpen(true)} />

      <main className="container mx-auto px-6 md:px-8 py-20 flex-1 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Traction Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover the fastest-growing products in the community. Rankings updated weekly based on user growth and engagement metrics.
          </p>
        </div>

        <TractionLeaderboard />
      </main>

      <Footer onContactClick={() => setContactDialogOpen(true)} />

      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>
  );
}
