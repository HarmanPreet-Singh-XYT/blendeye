"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, ShieldCheck, Settings } from "lucide-react";

export function AuthUserButton({ className }: { className?: string }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className={`h-8 w-20 rounded-md bg-secondary/40 animate-pulse ${className || ""}`} />
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/auth?mode=signin")}
        className={`h-8 text-xs border-accent/40 bg-accent/5 text-accent hover:bg-accent/15 gap-1.5 cursor-pointer font-mono ${className || ""}`}
        title="Sign in with Supabase to sync your projects across devices"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </Button>
    );
  }

  const userEmail = user.email || "Director";
  const userInitials = userEmail.slice(0, 2).toUpperCase();
  const directorName = user.user_metadata?.full_name || userEmail.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center justify-center rounded-md border text-xs font-medium transition-colors h-8 px-2.5 border-border/80 bg-secondary/30 hover:border-accent/40 gap-2 cursor-pointer ${className || ""}`}
      >
        <div className="h-4.5 w-4.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
          {userInitials}
        </div>
        <span className="font-mono text-xs max-w-[110px] truncate text-foreground">
          {directorName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-[#0e1117] border border-border/80 shadow-2xl p-1.5">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold leading-none text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {directorName}
            </p>
            <p className="text-[11px] leading-none text-muted-foreground truncate font-mono">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono flex items-center justify-between">
          <span>Auth Tier</span>
          <span className="text-accent font-medium">Supabase Cloud</span>
        </div>
        <DropdownMenuItem
          onClick={() => router.push("/auth")}
          className="text-xs text-muted-foreground hover:text-foreground focus:bg-secondary/60 cursor-pointer gap-2 px-2 py-1.5"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Account & Auth Center</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-xs text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer gap-2 px-2 py-1.5 font-medium"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

