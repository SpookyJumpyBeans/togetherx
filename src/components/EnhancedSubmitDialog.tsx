import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagSelector } from "@/components/ui/tag-selector";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  TARGET_AUDIENCE_SUGGESTIONS, 
  CATEGORY_SUGGESTIONS, 
  KEYWORD_SUGGESTIONS, 
  TECH_HIGHLIGHTS_SUGGESTIONS,
  USER_RANGES,
  REVENUE_RANGES,
  GROWTH_RATE_RANGES
} from "@/data/tagSuggestions";

interface EnhancedSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedSubmitDialog = ({ open, onOpenChange }: EnhancedSubmitDialogProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    websiteLink: "",
    screenshots: [] as File[],
    logo: null as File | null,
    logoPreview: "",
    description: "",
    targetAudience: [] as string[],
    category: [] as string[],
    contactEmail: "",
    tags: [] as string[],
    usesAI: false,
    techHighlights: [] as string[],
    users: "",
    revenue: "",
    growthRate: "",
    usersFile: null as File | null,
    revenueFile: null as File | null,
    growthFile: null as File | null,
    showOnLeaderboard: false,
    partnership: false,
    coMarketing: false,
    whiteLabel: false,
    reseller: false,
    acquisition: false,
    acquisitionDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation schema - only 4 required fields
  const formSchema = z.object({
    name: z.string().trim().min(1, "Product name is required").max(100, "Must be less than 100 characters"),
    websiteLink: z.string().trim().url({ message: "Valid website URL required" }).max(500, "Must be less than 500 characters"),
    description: z.string().trim().min(1, "Description is required").max(1000, "Must be less than 1000 characters"),
    contactEmail: z.string().trim().email("Valid email required").max(255, "Must be less than 255 characters"),
  });

  useEffect(() => {
    checkUser();
    loadSavedFormData();
  }, [open]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const saveFormData = () => {
    // Save text data to localStorage
    const dataToSave = {
      ...formData,
      screenshots: [],
      logo: null,
      logoPreview: formData.logoPreview,
      usersFile: null,
      revenueFile: null,
      growthFile: null,
    };
    localStorage.setItem('submitProductFormData', JSON.stringify(dataToSave));
    localStorage.setItem('auto_submit_after_auth', 'true');
    
    // Save file data to IndexedDB
    const filesToSave: { [key: string]: File } = {};
    if (formData.logo) filesToSave.logo = formData.logo;
    if (formData.usersFile) filesToSave.usersFile = formData.usersFile;
    if (formData.revenueFile) filesToSave.revenueFile = formData.revenueFile;
    if (formData.growthFile) filesToSave.growthFile = formData.growthFile;
    formData.screenshots.forEach((file, idx) => {
      filesToSave[`screenshot_${idx}`] = file;
    });
    
    if (Object.keys(filesToSave).length > 0) {
      saveFilesToIndexedDB(filesToSave);
    }
  };

  const loadSavedFormData = async () => {
    const savedData = localStorage.getItem('submitProductFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Load files from IndexedDB
        const savedFiles = await loadFilesFromIndexedDB();
        const screenshots: File[] = [];
        let logo: File | null = null;
        let usersFile: File | null = null;
        let revenueFile: File | null = null;
        let growthFile: File | null = null;
        
        Object.entries(savedFiles).forEach(([key, file]) => {
          if (key.startsWith('screenshot_')) {
            screenshots.push(file);
          } else if (key === 'logo') {
            logo = file;
          } else if (key === 'usersFile') {
            usersFile = file;
          } else if (key === 'revenueFile') {
            revenueFile = file;
          } else if (key === 'growthFile') {
            growthFile = file;
          }
        });
        
        setFormData(prev => ({ 
          ...prev, 
          ...parsed, 
          screenshots,
          logo,
          usersFile,
          revenueFile,
          growthFile
        }));
      } catch (e) {
        console.error('Failed to load saved form data');
      }
    }
  };

  const clearSavedFormData = () => {
    localStorage.removeItem('submitProductFormData');
    clearIndexedDBFiles();
  };

  // IndexedDB helpers for file persistence
  const saveFilesToIndexedDB = async (files: { [key: string]: File }) => {
    try {
      const db = await openFileDB();
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      
      for (const [key, file] of Object.entries(files)) {
        store.put(file, key);
      }
      
      return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Failed to save files to IndexedDB');
    }
  };

  const loadFilesFromIndexedDB = async (): Promise<{ [key: string]: File }> => {
    try {
      const db = await openFileDB();
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      
      const keysRequest = store.getAllKeys();
      const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
        keysRequest.onsuccess = () => resolve(keysRequest.result);
        keysRequest.onerror = () => reject(keysRequest.error);
      });
      
      const files: { [key: string]: File } = {};
      
      for (const key of keys) {
        const getRequest = store.get(key);
        const file = await new Promise<File | undefined>((resolve, reject) => {
          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => reject(getRequest.error);
        });
        if (file) files[key as string] = file;
      }
      
      return files;
    } catch (e) {
      return {};
    }
  };

  const clearIndexedDBFiles = async () => {
    try {
      const db = await openFileDB();
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.clear();
      
      return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Failed to clear IndexedDB files');
    }
  };

  const openFileDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ProductFormFiles', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
    });
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, ...files] }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'usersFile' | 'revenueFile' | 'growthFile') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate only required fields
    const result = formSchema.safeParse({
      name: formData.name,
      websiteLink: formData.websiteLink,
      description: formData.description,
      contactEmail: formData.contactEmail,
    });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Validate proof images for traction metrics
    if (formData.users && !formData.usersFile) {
      toast.error("Please upload proof image for Users/DAU/MAU");
      return;
    }
    if (formData.revenue && !formData.revenueFile) {
      toast.error("Please upload proof image for Revenue");
      return;
    }
    if (formData.growthRate && !formData.growthFile) {
      toast.error("Please upload proof image for Growth Rate");
      return;
    }

    // Check if user is authenticated after validation
    if (!user) {
      saveFormData();
      toast.info("Please sign in to submit your product");
      onOpenChange(false);
      
      const currentPath = window.location.pathname;
      localStorage.setItem('auth_return_to', currentPath);
      localStorage.setItem('auth_open_submit', 'true');
      setTimeout(() => {
        navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}&openSubmit=true`);
      }, 100);
      return;
    }

    setLoading(true);

    try {
      let screenshotUrls: string[] = [];
      let logoUrl = null;

      // Upload screenshots if provided
      if (formData.screenshots.length > 0) {
        const uploadPromises = formData.screenshots.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError, data } = await supabase.storage
            .from('product-assets')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(fileName);
          
          return publicUrl;
        });
        
        screenshotUrls = await Promise.all(uploadPromises);
      }

      // Upload logo if provided
      if (formData.logo) {
        const logoExt = formData.logo.name.split('.').pop();
        const logoPath = `${user.id}/logo_${Date.now()}.${logoExt}`;
        const { error: logoUploadError } = await supabase.storage
          .from('product-assets')
          .upload(logoPath, formData.logo);
        
        if (!logoUploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(logoPath);
          logoUrl = publicUrl;
        }
      }

      // Upload traction proof screenshots
      let usersScreenshotUrl = null;
      let revenueScreenshotUrl = null;
      let growthScreenshotUrl = null;

      if (formData.usersFile) {
        const fileExt = formData.usersFile.name.split('.').pop();
        const filePath = `${user.id}/proof_users_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from('product-assets')
          .upload(filePath, formData.usersFile);
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(filePath);
          usersScreenshotUrl = publicUrl;
        }
      }

      if (formData.revenueFile) {
        const fileExt = formData.revenueFile.name.split('.').pop();
        const filePath = `${user.id}/proof_revenue_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from('product-assets')
          .upload(filePath, formData.revenueFile);
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(filePath);
          revenueScreenshotUrl = publicUrl;
        }
      }

      if (formData.growthFile) {
        const fileExt = formData.growthFile.name.split('.').pop();
        const filePath = `${user.id}/proof_growth_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from('product-assets')
          .upload(filePath, formData.growthFile);
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-assets')
            .getPublicUrl(filePath);
          growthScreenshotUrl = publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          user_id: user.id,
          name: formData.name,
          website_link: formData.websiteLink,
          description: formData.description,
          contact_email: formData.contactEmail,
          screenshot_urls: screenshotUrls.length > 0 ? screenshotUrls : null,
          logo_url: logoUrl || null,
          target_audience: formData.targetAudience.length > 0 ? formData.targetAudience.join(', ') : null,
          category: formData.category.length > 0 ? formData.category.join(', ') : null,
          tags: formData.tags.length > 0 ? formData.tags.join(', ') : null,
          uses_ai: formData.usesAI,
          tech_highlights: formData.techHighlights.length > 0 ? formData.techHighlights.join(', ') : null,
          users: formData.users || null,
          revenue: formData.revenue || null,
          growth_rate: formData.growthRate || null,
          users_screenshot_url: usersScreenshotUrl,
          revenue_screenshot_url: revenueScreenshotUrl,
          growth_screenshot_url: growthScreenshotUrl,
          show_on_leaderboard: formData.showOnLeaderboard,
          partnership: formData.partnership,
          co_marketing: formData.coMarketing,
          white_label: formData.whiteLabel,
          reseller: formData.reseller,
          acquisition: formData.acquisition,
          acquisition_details: formData.acquisitionDetails || null,
        }]);

      if (insertError) throw insertError;

      toast.success("Product submitted successfully! It will be reviewed before going live.");
      
      clearSavedFormData();
      localStorage.removeItem('auto_submit_after_auth');
      onOpenChange(false);
      setFormData({
        name: "",
        websiteLink: "",
        screenshots: [],
        logo: null,
        logoPreview: "",
        description: "",
        targetAudience: [],
        category: [],
        contactEmail: "",
        tags: [],
        usesAI: false,
        techHighlights: [],
        users: "",
        revenue: "",
        growthRate: "",
        usersFile: null,
        revenueFile: null,
        growthFile: null,
        showOnLeaderboard: false,
        partnership: false,
        coMarketing: false,
        whiteLabel: false,
        reseller: false,
        acquisition: false,
        acquisitionDetails: "",
      });
    } catch (error: any) {
      toast.error("Failed to submit product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-6">
          <DialogTitle className="text-3xl font-bold">Submit Your Product</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Join the marketplace and connect with potential partners
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="TaskFlow AI"
              className={`h-12 bg-muted/30 border-0 ${errors.name ? 'border-2 border-destructive' : ''}`}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Website Link */}
          <div className="space-y-2">
            <Label htmlFor="websiteLink" className="text-base">Website Link *</Label>
            <Input
              id="websiteLink"
              type="url"
              value={formData.websiteLink}
              onChange={(e) => {
                setFormData({ ...formData, websiteLink: e.target.value });
                if (errors.websiteLink) setErrors({ ...errors, websiteLink: "" });
              }}
              placeholder="https://yourproduct.com"
              className={`h-12 bg-muted/30 border-0 ${errors.websiteLink ? 'border-2 border-destructive' : ''}`}
            />
            {errors.websiteLink && <p className="text-sm text-destructive">{errors.websiteLink}</p>}
          </div>

          {/* Product Logo */}
          <div className="space-y-2">
            <Label className="text-base">Product Logo</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-foreground/20 transition-colors cursor-pointer bg-muted/10"
              >
                {formData.logoPreview ? (
                  <img
                    src={formData.logoPreview}
                    alt="Logo Preview"
                    className="h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm font-medium mb-1">
                      Upload your logo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Product Screenshots */}
          <div className="space-y-3">
            <Label className="text-base">Product Screenshots</Label>
            {formData.screenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {formData.screenshots.map((file, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img src={URL.createObjectURL(file)} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(idx)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <span className="sr-only">Remove</span>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-foreground/20 transition-colors cursor-pointer bg-muted/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="text-base font-medium mb-1">Click to upload screenshots</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or WEBP</p>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleScreenshotChange} />
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: "" });
              }}
              placeholder="What does your product do? Who does it serve?"
              rows={4}
              className={`bg-muted/30 border-0 resize-none ${errors.description ? 'border-2 border-destructive' : ''}`}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label className="text-base">Target Audience</Label>
            <TagSelector
              value={formData.targetAudience}
              onChange={(tags) => setFormData({ ...formData, targetAudience: tags })}
              suggestions={TARGET_AUDIENCE_SUGGESTIONS}
              placeholder="Search or add custom audience..."
            />
          </div>

          {/* Category/Vertical */}
          <div className="space-y-2">
            <Label className="text-base">Category/Vertical</Label>
            <TagSelector
              value={formData.category}
              onChange={(tags) => setFormData({ ...formData, category: tags })}
              suggestions={CATEGORY_SUGGESTIONS}
              placeholder="Search or add custom category..."
            />
          </div>

          {/* Keywords/Tags */}
          <div className="space-y-2">
            <Label className="text-base">Keywords/Tags</Label>
            <TagSelector
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags: tags })}
              suggestions={KEYWORD_SUGGESTIONS}
              placeholder="Search or add custom keywords..."
            />
          </div>

          {/* Technology Highlights */}
          <div className="space-y-2">
            <Label className="text-base">Technology Highlights</Label>
            <TagSelector
              value={formData.techHighlights}
              onChange={(tags) => setFormData({ ...formData, techHighlights: tags })}
              suggestions={TECH_HIGHLIGHTS_SUGGESTIONS}
              placeholder="Search or add custom technologies..."
            />
          </div>

          {/* AI Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="usesAI"
              checked={formData.usesAI}
              onCheckedChange={(checked) => setFormData({ ...formData, usesAI: checked })}
            />
            <Label htmlFor="usesAI" className="text-base cursor-pointer">
              This product uses AI
            </Label>
          </div>

          {/* Traction Metrics */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-semibold">Traction Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Screenshots are confidential, used only for validation, and will not be visible publicly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users */}
              <div className="space-y-2">
                <Label htmlFor="users" className="text-base">Users/DAU/MAU</Label>
                <Select
                  value={formData.users}
                  onValueChange={(value) => setFormData({ ...formData, users: value })}
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-0">
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {USER_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'usersFile')}
                  className="hidden"
                  id="users-file"
                />
                <Label
                  htmlFor="users-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  {formData.users ? (
                    <span className="text-destructive">Proof Required {formData.usersFile && '✓'}</span>
                  ) : (
                    <span>Choose File {formData.usersFile && '✓'}</span>
                  )}
                </Label>
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-base">Revenue Range</Label>
                <Select
                  value={formData.revenue}
                  onValueChange={(value) => setFormData({ ...formData, revenue: value })}
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-0">
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {REVENUE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'revenueFile')}
                  className="hidden"
                  id="revenue-file"
                />
                <Label
                  htmlFor="revenue-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  {formData.revenue ? (
                    <span className="text-destructive">Proof Required {formData.revenueFile && '✓'}</span>
                  ) : (
                    <span>Choose File {formData.revenueFile && '✓'}</span>
                  )}
                </Label>
              </div>

              {/* Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="growthRate" className="text-base">Growth Rate</Label>
                <Select
                  value={formData.growthRate}
                  onValueChange={(value) => setFormData({ ...formData, growthRate: value })}
                >
                  <SelectTrigger className="h-12 bg-muted/30 border-0">
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {GROWTH_RATE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'growthFile')}
                  className="hidden"
                  id="growth-file"
                />
                <Label
                  htmlFor="growth-file"
                  className="flex items-center justify-center h-10 px-4 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer text-sm"
                >
                  {formData.growthRate ? (
                    <span className="text-destructive">Proof Required {formData.growthFile && '✓'}</span>
                  ) : (
                    <span>Choose File {formData.growthFile && '✓'}</span>
                  )}
                </Label>
              </div>
            </div>

            {/* Leaderboard Opt-in */}
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="showOnLeaderboard"
                checked={formData.showOnLeaderboard}
                onCheckedChange={(checked) => setFormData({ ...formData, showOnLeaderboard: checked })}
              />
              <Label htmlFor="showOnLeaderboard" className="text-base cursor-pointer">
                Show on leaderboard (opt-in)
              </Label>
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-base">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => {
                setFormData({ ...formData, contactEmail: e.target.value });
                if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" });
              }}
              placeholder="your@email.com"
              className={`h-12 bg-muted/30 border-0 ${errors.contactEmail ? 'border-2 border-destructive' : ''}`}
            />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
          </div>

          {/* Partnership Opportunities */}
          <div className="space-y-4 pt-6 border-t">
            <div>
              <h3 className="text-xl font-semibold mb-1">Open To</h3>
              <p className="text-sm text-muted-foreground">
                Select the opportunities you're interested in (optional)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'partnership', label: 'Partnership', description: 'Collaborate on mutual growth initiatives' },
                { id: 'coMarketing', label: 'Co-Marketing', description: 'Joint marketing campaigns and content' },
                { id: 'whiteLabel', label: 'White Label', description: 'License your product to other brands' },
                { id: 'reseller', label: 'Reseller', description: 'Partner with resellers and distributors' },
                { id: 'acquisition', label: 'Acquisition', description: 'Open to acquisition discussions' },
              ].map((option) => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={formData[option.id as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, [option.id]: checked })
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="font-medium">{option.label}</div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Acquisition Details */}
            {formData.acquisition && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="acquisitionDetails" className="text-base">Acquisition Details</Label>
                <Textarea
                  id="acquisitionDetails"
                  value={formData.acquisitionDetails}
                  onChange={(e) => setFormData({ ...formData, acquisitionDetails: e.target.value })}
                  placeholder="Provide details about your acquisition preferences, timeline, and expectations..."
                  rows={3}
                  className="bg-muted/30 border-0 resize-none"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
