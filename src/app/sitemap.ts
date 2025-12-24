
import { MetadataRoute } from 'next';

const staticRoutes = [
  '', // Homepage
  '/career-assessment',
  '/blog',
  '/career-faqs',
  '/pricing',
  '/contact',
  '/privacy-policy',
  '/terms-conditions',
  '/cancellation-refund',
  '/login',
  '/signup',
];

const blogPosts = [
  '/blog/reskilling-vs-upskilling',
  '/blog/will-ai-take-my-job',
  '/blog/passion-vs-salary',
  '/blog/career-counselling-in-india-guide',
  '/blog/is-career-counselling-worth-it',
  '/blog/ai-vs-human-career-counselling',
  '/blog/career-counselling-after-10th-mistakes',
  '/blog/career-counselling-after-12th-streams',
  '/blog/how-to-choose-the-right-career',
  '/blog/are-career-tests-accurate',
  '/blog/which-career-is-best-for-students',
  '/blog/best-career-move-for-working-professionals',
  '/blog/best-career-options-for-2026',
  '/blog/which-career-is-best-for-me',
  '/blog/find-your-dream-career',
  '/blog/dream-career-vs-reality',
  '/blog/why-most-people-never-find-their-dream-career',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://aicouncel.com';

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogUrls = blogPosts.map((post) => ({
    url: `${siteUrl}${post}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...blogUrls];
}
