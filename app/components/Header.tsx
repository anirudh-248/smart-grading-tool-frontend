"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-semibold">SmartGrader</span>
        </Link>

        <nav className="hidden md:flex items-center gap-3 ml-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link
            href="/evaluate"
            className="text-sm font-medium hover:underline"
          >
            Evaluate
          </Link>
        </nav>
      </div>

      <nav className="flex items-center gap-3">
        {!isLoggedIn ? (
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-solid border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="hidden sm:inline-block text-sm">Logout</span>
          </button>
        )}
      </nav>
    </header>
  );
}
