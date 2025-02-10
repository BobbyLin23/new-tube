'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ResponsiveModal } from '@/components/responsive-modal'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'

interface ThumbnailGenerateModalProps {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  prompt: z.string().min(10),
})

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success('Background job started', {
        description: 'It may take a few minutes to process',
      })
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  const onSubmit = (value: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({
      id: videoId,
      prompt: value.prompt,
    })
  }

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none"
                    cols={30}
                    rows={5}
                    placeholder="A description of wanted thumbnail"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit">Generate</Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
}
