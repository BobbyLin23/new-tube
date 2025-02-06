import { db } from '@/db'
import { categories } from '@/db/schema'

const categoryNames = [
  'Cars and vehicles',
  'Comedy',
  'Education',
  'Entertainment',
  'Gaming',
  'How to and style',
  'Music',
  'News and Politics',
  'Nonprofits and Activism',
  'People and Blogs',
  'Pets and Animals',
  'Science and Technology',
  'Sports',
  'Travel and Events',
]

async function main() {
  console.log('Seeding categories...')

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`,
    }))

    await db.insert(categories).values(values)
    console.log('Categories seeded successfully')
  } catch (error) {
    console.error('Error seeding categories:', error)
    process.exit(1)
  } finally {
    console.log('Finished seeding categories')
  }
}

main()
