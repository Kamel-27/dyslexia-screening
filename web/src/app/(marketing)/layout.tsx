/**
 * Marketing layout — public-facing pages (/, /instructions).
 * No shared chrome; each page handles its own header/footer inline.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
