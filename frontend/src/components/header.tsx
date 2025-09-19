import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full border-b border-[#37322f]/6 bg-[#f7f5f3] relative">
      <div className="font-title text-[#37322f] font-semibold text-lg absolute left-8 top-1/2 -translate-y-1/2">Reef</div>
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-end py-4">
          <Button variant="ghost" className="text-[#37322f] hover:bg-[#37322f]/5">
            Log in
          </Button>
        </nav>
      </div>
    </header>
  )
}
