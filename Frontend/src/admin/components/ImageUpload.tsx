/**
 * ImageUpload — holds the selected file locally.
 * Only uploads to the backend when `triggerUpload()` is called.
 *
 * Usage:
 *   const imgRef = useRef<ImageUploadHandle>(null);
 *   ...
 *   // on save:
 *   const url = await imgRef.current?.triggerUpload();
 *
 * Props:
 *   folder   — supabase storage subfolder e.g. "projects"
 *   value    — current image URL (from DB)
 *   onChange — called with the new URL after a successful upload
 */
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface ImageUploadHandle {
  /** Uploads the pending file (if any) and returns the final URL. */
  triggerUpload: () => Promise<string | null>;
  /** True when a new file has been selected but not yet uploaded. */
  hasPendingFile: boolean;
}

interface Props {
  folder: string;
  value: string;           // current URL saved in DB
  onChange: (url: string) => void;
  className?: string;
}

export const ImageUpload = forwardRef<ImageUploadHandle, Props>(
  ({ folder, value, onChange, className }, ref) => {
    const { session } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);

    // preview is either the DB url (value) or a local object-URL for the pending file
    const [preview, setPreview] = useState<string>(value);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // keep preview in sync if parent resets value (e.g. form reset)
    // only when there's no pending file
    if (!pendingFile && preview !== value) {
      setPreview(value);
    }

    useImperativeHandle(ref, () => ({
      hasPendingFile: !!pendingFile,
      triggerUpload: async () => {
        if (!pendingFile) return value || null; // nothing new → return existing
        if (!session?.access_token) {
          toast.error("Not authenticated");
          return null;
        }
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", pendingFile);
          const res = await fetch(`${BASE_URL}/api/upload?folder=${folder}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body.error ?? "Upload failed");
          const url: string = body.url;
          onChange(url);
          setPendingFile(null);
          setPreview(url);
          return url;
        } catch (err: any) {
          toast.error(err.message ?? "Upload failed");
          return null;
        } finally {
          setUploading(false);
        }
      },
    }));

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPendingFile(file);
      setPreview(URL.createObjectURL(file)); // local preview immediately
    };

    const clear = () => {
      setPendingFile(null);
      setPreview("");
      onChange("");
      if (inputRef.current) inputRef.current.value = "";
    };

    return (
      <div className={`flex flex-col gap-2 ${className ?? ""}`}>
        {/* Preview box */}
        <div className="relative w-24 h-24 rounded-lg border border-border bg-secondary flex items-center justify-center overflow-hidden">
          {preview ? (
            <>
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clear}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs text-white">Uploading…</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} className="mr-1" />
          {pendingFile ? "Change" : "Upload"}
        </Button>
        {pendingFile && (
          <p className="text-xs text-muted-foreground">
            "{pendingFile.name}" ready — will upload on save
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    );
  }
);

ImageUpload.displayName = "ImageUpload";