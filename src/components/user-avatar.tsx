import { cva, VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

const avatarVariants = cva('', {
  variants: {
    size: {
      default: 'h-9 w-9',
      xs: 'h-4 w-4',
      sm: 'w-6 h-6',
      lg: 'w-10 h-10',
      xl: 'h-[160px] w-[160px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string
  name: string
  className?: string
  onClick?: () => void
}

export const UserAvatar = ({
  imageUrl,
  name,
  className,
  size,
  onClick,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onClick}
    >
      <AvatarImage src={imageUrl} alt={name} />
    </Avatar>
  )
}
