'use client'

import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from '@mux/mux-uploader-react'
import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface StudioUploaderProps {
  endpoint?: string | null
  onSuccess: () => void
}

const UPLOADER_ID = 'video-uploader'

export const StudioUploader = ({
  endpoint,
  onSuccess,
}: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        onSuccess={onSuccess}
        endpoint={endpoint}
        id={UPLOADER_ID}
        className="group/uploader hidden"
      />
      <MuxUploaderDrop>
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex size-32 items-center justify-center gap-2 rounded-full bg-muted">
            <Upload className="group/drop-[&[active]]:animate-bounce size-10 text-muted-foreground transition-all duration-300" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop your video here to upload</p>
            <p className="text-xs text-muted-foreground">
              Your videos will be private until you publish them
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
            <Button type="button" className="rounded-full">
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="hidden" />
        <MuxUploaderStatus muxUploader={UPLOADER_ID} className="text-sm" />
        <MuxUploaderProgress
          className="text-sm"
          type="percentage"
          muxUploader={UPLOADER_ID}
        />
        <MuxUploaderProgress
          muxUploader={UPLOADER_ID}
          className="text-sm"
          type="bar"
        />
      </MuxUploaderDrop>
    </div>
  )
}
