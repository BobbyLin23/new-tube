'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Video } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { StudioSidebarHeader } from './studio-sidebar-header'

export const StudioSidebar = () => {
  const pathname = usePathname()

  return (
    <Sidebar className="z-40 pt-16" collapsible="icon">
      <SidebarContent className="bg-backgroud">
        <SidebarGroup>
          <SidebarMenu>
            <StudioSidebarHeader />
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname === '/studio'}
                tooltip="Content"
                asChild
              >
                <Link href="/studio/videos">
                  <Video className="size-5" />
                  <span className="text-sm">Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Exit studio" asChild>
                <Link href="/">
                  <LogOut className="size-5" />
                  <span className="text-sm">Exit studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
