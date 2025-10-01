export function SimpleFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-foreground">
            NextTaskPro
          </div>
          <p className="text-muted-foreground">
            AI-powered task management that actually works.
          </p>
          <div className="text-sm text-muted-foreground">
            © 2024 NextTaskPro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}