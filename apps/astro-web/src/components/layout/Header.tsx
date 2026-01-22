"use client";

import { Link } from "@/components/ui/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/astro/react";
import { Button } from "@/components/ui/button";
import { withConvex } from "@/components/ConvexClientProvider";

function HeaderInner() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.png" alt="IRJEP Logo" className="h-10 w-auto" />
                    <span className="font-serif text-2xl font-bold tracking-tight text-primary">IRJEP</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                    <Link href="/aim-scope" className="hover:text-primary transition-colors">Aim & Scope</Link>
                    <Link href="/issues" className="hover:text-primary transition-colors">Issues</Link>
                    <Link href="/editorial-board" className="hover:text-primary transition-colors">Editorial Board</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">Dashboard</Button>
                        </Link>
                        <UserButton />
                    </SignedIn>
                    <Link href="/submit">
                        <Button size="sm">Submit Paper</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export const Header = withConvex(HeaderInner);
