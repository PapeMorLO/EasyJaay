export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* On peut mettre un header global ici plus tard si nécessaire */}
      <main>{children}</main>
    </div>
  )
}