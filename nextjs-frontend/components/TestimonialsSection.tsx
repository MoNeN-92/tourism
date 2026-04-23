import Link from 'next/link'
import { type LocalizedTrustTestimonial } from '@/lib/trust-signals'

export default function TestimonialsSection({
  locale,
  title,
  subtitle,
  ctaLabel,
  emptyLabel,
  testimonials,
}: {
  locale: string
  title: string
  subtitle: string
  ctaLabel: string
  emptyLabel: string
  testimonials: LocalizedTrustTestimonial[]
}) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">{title}</h2>
          <p className="mt-4 text-base leading-8 text-[#4f5f70]">{subtitle}</p>
        </div>

        {testimonials.length > 0 ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-[28px] border border-[#e5dfd4] bg-[#f8f5ef] p-8 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6f3d]">
                  {testimonial.verifiedLabel}
                </p>
                <blockquote className="mt-5 text-xl leading-9 text-[#101820]">
                  “{testimonial.quote}”
                </blockquote>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[#101820]">{testimonial.personName}</p>
                    <p className="mt-1 text-sm leading-7 text-[#576273]">{testimonial.role}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7367]">
                      {testimonial.sourceLabel}
                    </p>
                  </div>
                  {testimonial.sourceSlug ? (
                    <Link
                      href={`/${locale}/blog/${testimonial.sourceSlug}`}
                      className="inline-flex min-h-[44px] items-center rounded-full bg-[#101820] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0f6b66]"
                    >
                      {ctaLabel}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-dashed border-[#d3cab9] bg-[#fffaf1] px-6 py-12 text-center text-[#687384]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  )
}
