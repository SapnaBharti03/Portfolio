import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrudTableSkeleton } from "@/admin/components/AdminSkeletons";

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
  emptyMessage?: string;
  loading?: boolean;
  skeletonColumns?: number;
}

export function CrudTable<T extends { id: number | string }>({
  rows,
  columns,
  onEdit,
  onDelete,
  emptyMessage = "No records yet.",
  loading = false,
  skeletonColumns,
}: Props<T>) {
  if (loading) {
    return <CrudTableSkeleton columns={skeletonColumns ?? columns.length} />;
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
            {columns.map((c) => (
              <TableHead key={String(c.key)} className={c.className}>
                {c.header}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={String(row.id)}>
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