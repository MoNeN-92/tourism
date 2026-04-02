type LocaleKey = 'ka' | 'en' | 'ru'

type TourFormData = Record<string, string | boolean>

const SECTION_CONFIG: Record<
  LocaleKey,
  {
    heading: string
    titleLabel: string
    descriptionLabel: string
    locationLabel: string
  }
> = {
  ka: {
    heading: '🇬🇪 Georgian (ქართული)',
    titleLabel: 'Title *',
    descriptionLabel: 'Description *',
    locationLabel: 'Location',
  },
  en: {
    heading: '🇬🇧 English',
    titleLabel: 'Title *',
    descriptionLabel: 'Description *',
    locationLabel: 'Location',
  },
  ru: {
    heading: '🇷🇺 Russian (Русский)',
    titleLabel: 'Title *',
    descriptionLabel: 'Description *',
    locationLabel: 'Location',
  },
}

const EXTRA_FIELDS = [
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'idealFor', label: 'Ideal For' },
  { key: 'includes', label: 'What Is Included' },
  { key: 'excludes', label: 'What Is Not Included' },
  { key: 'pickup', label: 'Pickup / Meeting Point' },
  { key: 'bestSeason', label: 'Best Season' },
] as const

export default function TourLocalizedFields({
  localeKey,
  formData,
  onChange,
}: {
  localeKey: LocaleKey
  formData: TourFormData
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
  const config = SECTION_CONFIG[localeKey]

  return (
    <div className="border-b border-gray-200 pb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{config.heading}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor={`title_${localeKey}`} className="block text-sm font-medium text-gray-700 mb-2">
            {config.titleLabel}
          </label>
          <input
            type="text"
            id={`title_${localeKey}`}
            name={`title_${localeKey}`}
            value={(formData[`title_${localeKey}`] as string) || ''}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor={`description_${localeKey}`} className="block text-sm font-medium text-gray-700 mb-2">
            {config.descriptionLabel}
          </label>
          <textarea
            id={`description_${localeKey}`}
            name={`description_${localeKey}`}
            value={(formData[`description_${localeKey}`] as string) || ''}
            onChange={onChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor={`location_${localeKey}`} className="block text-sm font-medium text-gray-700 mb-2">
            {config.locationLabel}
          </label>
          <input
            type="text"
            id={`location_${localeKey}`}
            name={`location_${localeKey}`}
            value={(formData[`location_${localeKey}`] as string) || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {EXTRA_FIELDS.map((field) => (
          <div key={`${field.key}_${localeKey}`}>
            <label htmlFor={`${field.key}_${localeKey}`} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <textarea
              id={`${field.key}_${localeKey}`}
              name={`${field.key}_${localeKey}`}
              value={(formData[`${field.key}_${localeKey}`] as string) || ''}
              onChange={onChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
