'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Copy,
  CopyCheck,
  Globe2,
  ImagePlus,
  Lock,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Trash,
} from 'lucide-react'
import { toast } from 'sonner'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { videoUpdateSchema } from '@/db/schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VideoPlayer } from '@/modules/videos/ui/components/video-player'
import { snakeCaseToTitle } from '@/lib/utils'
import { ThumbnailUploadModal } from '../components/thumbnail-upload-modal'

export const FormSection = ({ videoId }: { videoId: string }) => {
  return (
    <Suspense>
      <ErrorBoundary fallback={<FormSectionSkeleton />}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

const FormSectionSkeleton = () => {
  return <div>Loading...</div>
}

const FormSectionSuspense = ({ videoId }: { videoId: string }) => {
  const router = useRouter()

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  const [categories] = trpc.categories.getMany.useSuspenseQuery()

  const utils = trpc.useUtils()

  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false)

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success('Video updated')
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  const remove = trpc.videos.delete.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      toast.success('Video deleted')
      router.push('/studio')
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate()
      utils.studio.getOne.invalidate({ id: videoId })
      toast.success('Thumbnail restored')
    },
    onError: () => {
      toast.error('Something went wrong')
    },
  })

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    defaultValues: video,
    resolver: zodResolver(videoUpdateSchema),
  })

  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data)
  }

  const fullUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/videos/${video.id}`
  const [isCopied, setIsCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={isThumbnailModalOpen}
        onOpenChange={setIsThumbnailModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: video.id })}
                  >
                    <Trash className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="group relative h-[84px] w-[153px] border border-dashed border-neutral-400 p-0.5">
                        <Image
                          src={video.thumbnailUrl ?? 'placeholder.svg'}
                          fill
                          className="object-cover"
                          alt="Thumbnail"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 rounded-full bg-black/50 opacity-100 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
                            >
                              <MoreVertical className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setIsThumbnailModalOpen(true)}
                            >
                              <ImagePlus className="mr-1 size-4" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Sparkles className="mr-1 size-4" />
                              AI-Generated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: video.id })
                              }
                            >
                              <RotateCcw className="mr-1 size-4" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#F9F9F9]">
                <div className="relative aspect-video overflow-hidden">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className="flex flex-col gap-y-6 p-4">
                  <div className="flex items-center justify-between gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          disabled={isCopied}
                          onClick={onCopy}
                        >
                          {isCopied ? <CopyCheck /> : <Copy />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || 'no_status')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Subtitles status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || 'no_subtitles',
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2 className="mr-2 size-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <Lock className="mr-2 size-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
