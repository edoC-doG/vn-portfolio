import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Shown for a path under /vi or /en that has no page. Bilingual, since a not-found page has no dictionary to read.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-gold">404</p>
      <h1 className="font-display text-4xl font-bold">Lạc đường rồi · Off the map</h1>
      <p className="text-muted-foreground">Trang này không có trên hành trình. · This page is not on the journey.</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/vi">Về Lũng Cú</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/en">Back to Lũng Cú</Link>
        </Button>
      </div>
    </main>
  );
}
