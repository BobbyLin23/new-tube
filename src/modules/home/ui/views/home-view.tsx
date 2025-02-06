import { CategoriesSection } from '../sections/categories-section'

interface Props {
  categoryId?: string
}

export const HomeView = ({ categoryId }: Props) => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
    </div>
  )
}
