
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export const SEO = ({ title, description, canonical }: SEOProps) => (
  <Helmet>
    <title>{title}</title>
    {description && <meta name="description" content={description.slice(0, 155)} />}
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description.slice(0, 155)} />}
  </Helmet>
);
