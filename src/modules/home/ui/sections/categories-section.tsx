'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { trpc } from '@/trpc/client'
import { FilterCarousel } from '@/components/filter-carousel'

interface Props {
  categoryId?: string
}

const CategoriesSectionSuspense = ({ categoryId }: Props) => {
  const router = useRouter()
  const [categories] = trpc.categories.getMany.useSuspenseQuery()

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href)

    if (value) {
      url.searchParams.set('categoryId', value)
    } else {
      url.searchParams.delete('categoryId')
    }

    router.push(url.toString())
  }

  return <FilterCarousel value={categoryId} data={data} onSelect={onSelect} />
}

export const CategoriesSection = ({ categoryId }: Props) => {
  return (
    <Suspense>
      <ErrorBoundary
        fallback={<FilterCarousel data={[]} onSelect={() => {}} isLoading />}
      >
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}
