"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-danger font-medium">Notice</span>
          <h1 className="font-display text-scale-32 font-normal mt-1">
            Unexpected Workshop Interruption
          </h1>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            A temporary system error interrupted this request. Our workshop features are designed to degrade gracefully.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} size="sm" className="w-full sm:w-auto text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Request
          </Button>
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
