export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-secondary/60 animate-pulse ${className}`} />;
}