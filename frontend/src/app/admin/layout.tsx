export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The login page should not be wrapped in AdminProtectedRoute
  // This will be handled by the page component itself
  // Also remove the footer for admin pages
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
