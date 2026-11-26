import { Link } from 'react-router'
import { useContent } from '@/lib/content'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const { profile, settings } = useContent()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__name">{profile.name}</p>
          <p className="footer__meta">
            {profile.title} · {profile.location}
          </p>
        </div>
        <SocialLinks />
        <p className="footer__note">
          © {new Date().getFullYear()} {profile.name}. {settings.footerNote}{' '}
          <Link to="/admin" className="footer__admin" rel="nofollow">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  )
}
