import { redirect } from 'next/navigation'

export default async function AccountIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/account/notifications`)
}
