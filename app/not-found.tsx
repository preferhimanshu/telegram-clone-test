import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--tg-bg)] text-[var(--tg-text)] p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-xs text-[var(--tg-text-secondary)] mb-4">The requested page does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-[var(--tg-primary)] text-white text-xs font-semibold"
      >
        Return to Chats
      </Link>
    </div>
  );
}
