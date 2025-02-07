'use client'

import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'
import { ResponsiveModal } from '@/components/responsive-modal'
import { StudioUploader } from './studio-uploader'

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success('Video created')
      utils.studio.getMany.invalidate()
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
        Create
      </Button>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={() => {}} />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </ResponsiveModal>
    </>
  )
}
