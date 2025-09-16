export function SimpleFooter() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-white">
            NextTaskPro
          </div>
          <p className="text-slate-300">
            AI-powered task management that actually works.
          </p>
          <div className="text-sm text-slate-400">
            © 2024 NextTaskPro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}