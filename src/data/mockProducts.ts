export interface Product {
  id: string;
  name: string;
  logo: string;
  image?: string;
  description: string;
  targetAudience: string;
  category: string;
  tags: string[];
  usesAI: boolean;
  techHighlights: string[];
  traction: {
    users?: number;
    mau?: number;
    revenue?: string;
  };
  partnerships: {
    coMarketing: boolean;
    whiteLabel: boolean;
    acquisition: boolean;
    reseller: boolean;
  };
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "CodeFlow AI",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=codeflow",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    description: "AI-powered code review and optimization platform for development teams",
    targetAudience: "B2B SaaS",
    category: "DevTools",
    tags: ["AI", "Development", "Code Review"],
    usesAI: true,
    techHighlights: ["GPT-4 Integration", "Static Analysis", "Real-time Collaboration"],
    traction: {
      users: 15000,
      mau: 8500,
      revenue: "$50k MRR",
    },
    partnerships: {
      coMarketing: true,
      whiteLabel: true,
      acquisition: false,
      reseller: true,
    },
  },
  {
    id: "2",
    name: "MarketPulse",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=marketpulse",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    description: "Real-time market intelligence and competitor tracking for e-commerce brands",
    targetAudience: "B2B Enterprise",
    category: "MarTech",
    tags: ["Analytics", "E-commerce", "Market Research"],
    usesAI: true,
    techHighlights: ["Machine Learning", "Real-time Data Pipeline", "REST API"],
    traction: {
      users: 2500,
      mau: 1800,
      revenue: "$30k MRR",
    },
    partnerships: {
      coMarketing: true,
      whiteLabel: false,
      acquisition: true,
      reseller: false,
    },
  },
  {
    id: "3",
    name: "LegalDocs Pro",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=legaldocs",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    description: "Automated legal document generation and contract management for SMBs",
    targetAudience: "SMB",
    category: "LegalTech",
    tags: ["Legal", "Automation", "Documents"],
    usesAI: true,
    techHighlights: ["Document AI", "OCR Technology", "Smart Contracts"],
    traction: {
      users: 5000,
      mau: 3200,
      revenue: "$15k MRR",
    },
    partnerships: {
      coMarketing: true,
      whiteLabel: true,
      acquisition: false,
      reseller: true,
    },
  },
  {
    id: "4",
    name: "HealthTrack Connect",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=healthtrack",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
    description: "Patient engagement platform connecting healthcare providers with patients",
    targetAudience: "B2B Healthcare",
    category: "HealthTech",
    tags: ["Healthcare", "Patient Care", "Communication"],
    usesAI: true,
    techHighlights: ["Computer Vision", "Predictive Analytics", "HIPAA Compliant"],
    traction: {
      users: 50000,
      mau: 28000,
      revenue: "$120k MRR",
    },
    partnerships: {
      coMarketing: true,
      whiteLabel: true,
      acquisition: true,
      reseller: false,
    },
  },
  {
    id: "5",
    name: "EduStream",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=edustream",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop",
    description: "Interactive live streaming platform for online education and courses",
    targetAudience: "B2C Education",
    category: "EdTech",
    tags: ["Education", "Streaming", "Online Learning"],
    usesAI: true,
    techHighlights: ["AI Content Recommendations", "WebRTC", "Cloud Infrastructure"],
    traction: {
      users: 125000,
      mau: 45000,
      revenue: "$85k MRR",
    },
    partnerships: {
      coMarketing: true,
      whiteLabel: true,
      acquisition: false,
      reseller: true,
    },
  },
  {
    id: "6",
    name: "FinSync",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=finsync",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
    description: "Multi-bank account aggregation and financial planning for freelancers",
    targetAudience: "B2C FinTech",
    category: "FinTech",
    tags: ["Finance", "Banking", "Personal Finance"],
    usesAI: false,
    techHighlights: ["Blockchain", "Plaid API", "Multi-currency Support"],
    traction: {
      users: 32000,
      mau: 21000,
      revenue: "$40k MRR",
    },
    partnerships: {
      coMarketing: false,
      whiteLabel: true,
      acquisition: true,
      reseller: false,
    },
  },
];
