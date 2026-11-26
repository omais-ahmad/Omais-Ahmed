import type { SocialIcon } from '@/content/types'
import { useContent } from '@/lib/content'
import { safeExternalUrl } from '@/lib/format'
import { Icon, type IconName } from './Icon'

const ICONS: Record<SocialIcon, IconName> = {
  github: 'github',
  linkedin: 'linkedin',
  email: 'mail',
  link: 'link',
}

export function SocialLinks({ withLabels = false }: { withLabels?: boolean }) {
  const { socialLinks } = useContent()
  if (socialLinks.length === 0) return null
  return (
    <ul className={`social${withLabels ? ' social--labels' : ''}`}>
      {socialLinks.map((link) => {
        const href = safeExternalUrl(link.url)
        if (!href) return null
        const external = href.startsWith('http')
        return (
          <li key={link.id}>
            <a
              className="social__link"
              href={href}
              aria-label={withLabels ? undefined : link.label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Icon name={ICONS[link.icon] ?? 'link'} />
              {withLabels && <span>{link.label}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
