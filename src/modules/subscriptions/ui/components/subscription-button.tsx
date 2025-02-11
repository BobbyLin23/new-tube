import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SubscriptionButtonProps {
  onClick: ButtonProps['onClick']
  disabled: boolean
  isSubscribed: boolean
  className?: string
  size?: ButtonProps['size']
}

export const SubscriptionButton = ({
  onClick,
  disabled,
  isSubscribed,
  className,
  size = 'sm',
}: SubscriptionButtonProps) => {
  return (
    <Button
      size={size}
      onClick={onClick}
      disabled={disabled}
      variant={isSubscribed ? 'secondary' : 'default'}
      className={cn(className, 'rounded-full')}
    >
      {isSubscribed ? 'UnSubscribe' : 'Subscribe'}
    </Button>
  )
}
