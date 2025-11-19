import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-100 dark:border-zinc-800 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold">SmartGrader</div>
            <div className="text-sm text-zinc-500">
              Fair, fast, and insightful grading
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
