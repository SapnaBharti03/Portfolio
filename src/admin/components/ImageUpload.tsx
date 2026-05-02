import { useRef, useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);

  useEffect(() => setPreview(value), [value]);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="preview" className="h-32 w-32 rounded-lg object-cover border border-border" />
          <button
            type="button"
            onClick={() => {
              setPreview("");
              onChange("");
            }}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="h-32 w-32 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
          No image
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </div>
  );
}