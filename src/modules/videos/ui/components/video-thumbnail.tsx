import Image from 'next/image'

export const VideoThumbnail = () => {
  return (
    <div className="relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src="/placeholder.svg"
          alt="Thumbnail"
          fill
          className="size-full object-cover"
        />
      </div>
    </div>
  )
}
