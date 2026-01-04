import { ViewModeProvider } from "@/components/view-mode-provider"
import { NavigationMenu } from "@/components/navigation-menu"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewModeProvider>
      <header className="border-b bg-background relative">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <NavigationMenu />
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </ViewModeProvider>
  )
}