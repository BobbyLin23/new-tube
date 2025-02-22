import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface ResponsiveModalProps {
  open: boolean
  title: string
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const ResponsiveModal = ({
  open,
  title,
  onOpenChange,
  children,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
