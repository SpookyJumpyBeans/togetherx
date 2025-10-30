import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TractionLeaderboard } from "@/components/TractionLeaderboard";
import { SubscribeDialog } from "@/components/SubscribeDialog";
import { ContactDialog } from "@/components/ContactDialog";
import { DbProductDetailDialog } from "@/components/DbProductDetailDialog";
import { DbProduct } from "@/components/DbProductCardWithPin";

export default function Leaderboard() {
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleProductClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSubscribeClick={() => setSubscribeDialogOpen(true)} />

      <main className="container mx-auto px-6 md:px-8 py-20 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm mb-6">
              🏆 Traction Leaderboard
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Fastest-Growing Products
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Community products ranked by growth, users, and traction metrics
            </p>
          </div>

          <TractionLeaderboard onProductClick={handleProductClick} />
        </div>
      </main>

      <Footer onContactClick={() => setContactDialogOpen(true)} />

      <SubscribeDialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <DbProductDetailDialog
        product={selectedProduct}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
