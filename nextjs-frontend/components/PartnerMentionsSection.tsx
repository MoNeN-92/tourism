import Image from 'next/image'
import Link from 'next/link'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { type LocalizedPartnerMention } from '@/lib/trust-signals'

export default function PartnerMentionsSection({
  locale,
  title,
  subtitle,
  ctaLabel,
  partners,
}: {
  locale: string
  title: string
  subtitle: string
  ctaLabel: string
  partners: LocalizedPartnerMention[]
}) {
  return (
    <section className="py-14 bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title || subtitle ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              {title ? <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">{title}</h2> : null}
              {subtitle ? <p className="mt-4 text-base leading-8 text-[#4f5f70]">{subtitle}</p> : null}
            </div>
            <Link
              href={`/${locale}/partner-hotels`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#101820] px-5 text-sm font-medium text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : (
          <div className="flex justify-end">
            <Link
              href={`/${locale}/partner-hotels`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#101820] px-5 text-sm font-medium text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
            >
              {ctaLabel}
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => (
            <article
              key={partner.id}
              className="group overflow-hidden rounded-[28px] border border-[#e5dfd4] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Link href={`/${locale}/partner-hotels/${partner.slug}`}>
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    src={buildCloudinaryUrl(partner.coverImageUrl)}
                    alt={partner.name}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold text-[#101820]">{partner.name}</h3>
                    <span className="rounded-full bg-[#efe8da] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6258]">
                      {partner.starRating}/5
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-[#6a6258]">
                    {partner.address}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#576273]">
                    {partner.description}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
