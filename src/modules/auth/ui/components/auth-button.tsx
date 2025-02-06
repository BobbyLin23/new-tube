'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { UserCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const AuthButton = () => {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="rounded-full border-blue-500/20 px-4 py-2 font-medium text-blue-600 shadow-none hover:text-blue-500 [&_svg]:size-5"
          >
            <UserCircle />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  )
}
