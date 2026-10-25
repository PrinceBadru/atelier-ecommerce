import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-accent">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-medium">Error 404</span>
          <h1 className="font-display text-scale-32 sm:text-scale-48 font-normal tracking-tight mt-1">
            Path Uncharted
          </h1>
          <p className="text-xs sm:text-scale-14 text-muted-foreground mt-3 leading-relaxed">
            The studio page or workshop piece you are seeking does not exist or has been archived.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/products">
            <Button size="sm" className="w-full sm:w-auto text-xs">
              Explore Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
