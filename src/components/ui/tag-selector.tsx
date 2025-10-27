import { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
}

export const TagSelector = ({ 
  value, 
  onChange, 
  suggestions, 
  placeholder = "Type to search or add custom...",
  label 
}: TagSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setSearchTerm("");
      inputRef.current?.focus();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      // Add custom tag if it doesn't exist in suggestions or already selected
      if (!value.includes(searchTerm.trim())) {
        handleAddTag(searchTerm.trim());
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 h-12 bg-muted/30 border-0"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown with Search Results */}
      {isOpen && (searchTerm || filteredSuggestions.length > 0) && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            <ScrollArea className="max-h-64">
              {filteredSuggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Search Results ({filteredSuggestions.length})
                  </p>
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        handleAddTag(suggestion);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {searchTerm && !value.includes(searchTerm.trim()) && (
                <div className="p-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddTag(searchTerm.trim());
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors text-sm font-medium"
                  >
                    Add custom: "{searchTerm}"
                  </button>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};
