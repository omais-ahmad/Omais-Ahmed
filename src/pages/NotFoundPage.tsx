import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { useContent } from '@/lib/content'
import { Seo } from '@/lib/seo'

export function NotFoundPage() {
  const { profile } = useContent()
  return (
    <section className="not-found">
      <Seo
        title={`Page not found | ${profile.name}`}
        description="The page you are looking for does not exist."
        path="/404.html"
        noindex
      />
      <div className="container">
        <p className="eyebrow">
          <span className="eyebrow__index">404</span>Not found
        </p>
        <h1>This page does not exist.</h1>
        <p>The link may be out of date, or the project may have been unpublished.</p>
        <Link to="/" className="button button--primary">
          <Icon name="arrow-left" size={16} />
          Back to the portfolio
        </Link>
      </div>
    </section>
  )
}
