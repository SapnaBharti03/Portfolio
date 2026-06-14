import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudTableSkeleton } from "@/admin/components/AdminSkeletons";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T extends { id: number | string }> {
  rows: T[];
  columns: Column<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  onReorder?: (rows: T[]) => void | Promise<void>;
  emptyMessage?: string;
  loading?: boolean;
  skeletonColumns?: number;
}

export function CrudTable<T extends { id: number | string }>({
  rows,
  columns,
  onEdit,
  onDelete,
  onReorder,
  emptyMessage = "No records yet.",
  loading = false,
  skeletonColumns,
}: Props<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const sortable = Boolean(onReorder);

  const finishDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (!onReorder || dragIndex === null || dragIndex === targetIndex) {
      finishDrag();
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    void onReorder(next);
    finishDrag();
  };

  if (loading) {
    return <CrudTableSkeleton columns={(skeletonColumns ?? columns.length) + (sortable ? 1 : 0)} />;
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/40 px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {sortable && <TableHead className="w-10" />}
            {columns.map((c) => (
              <TableHead key={String(c.key)} className={c.className}>
                {c.header}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={String(row.id)}
              onDragOver={(e) => {
                if (!sortable || dragIndex === null) return;
                e.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() => setOverIndex(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              className={cn(
                overIndex === index && dragIndex !== null && dragIndex !== index && "bg-primary/10",
              )}
            >
              {sortable && (
                <TableCell className="w-10 px-2 text-muted-foreground">
                  <button
                    type="button"
                    draggable
                    aria-label="Drag to reorder"
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary cursor-grab active:cursor-grabbing"
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={finishDrag}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              )}
              {columns.map((c) => (
                <TableCell key={String(c.key)} className={c.className}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
