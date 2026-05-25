import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DishDetailClient from '@/components/public/menu/DishDetailClient'
import type { Metadata } from 'next'
import type { MenuItem, MenuCategory } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('menu_items')
    .select('name, description')
    .eq('slug', slug)
    .single()

  const item = data as Pick<MenuItem, 'name' | 'description'> | null
  if (!item) return { title: 'Dish Not Found' }

  return {
    title: item.name,
    description: item.description ?? `Order ${item.name} from Éclat Restaurant`,
  }
}

export default async function DishPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: rawItem } = await supabase
    .from('menu_items')
    .select('*, menu_categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_available', true)
    .single()

  const item = rawItem as (MenuItem & {
    menu_categories: Pick<MenuCategory, 'id' | 'name' | 'slug'> | null
  }) | null

  if (!item) notFound()

  const { data: rawRelated } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', item.category_id)
    .eq('is_available', true)
    .neq('id', item.id)
    .limit(4)

  const related = (rawRelated ?? []) as MenuItem[]

  return <DishDetailClient item={item} related={related} />
}