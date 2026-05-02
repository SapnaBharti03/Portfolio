import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function PageHeader({ title, description, onAdd, addLabel = "Add new" }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {onAdd && (
        <Button onClick={onAdd} variant="hero">
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}