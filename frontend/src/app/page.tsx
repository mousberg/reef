import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Reef
        </h1>
        <p className="text-muted-foreground mb-6">
          A clean Next.js starter with Tailwind CSS and shadcn/ui
        </p>
        <Button>Get Started</Button>
      </main>
    </div>
  );
}
