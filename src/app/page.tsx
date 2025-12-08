import { getConfig } from '@/lib/config';
import { getMarkdownContent, getBibtexContent, getTomlContent, getPageConfig } from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import Profile from '@/components/home/Profile';
import About from '@/components/home/About';
import SelectedPublications from '@/components/home/SelectedPublications';
import News, { NewsItem } from '@/components/home/News';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';

import { Publication } from '@/types/publication';
import { BasePageConfig, PublicationPageConfig, TextPageConfig, CardPageConfig } from '@/types/page';

// Define types for section config
interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
}

type PageData =
  | { type: 'about', id: string, sections: SectionConfig[] }
  | { type: 'publication', id: string, config: PublicationPageConfig, publications: Publication[] }
  | { type: 'text', id: string, config: TextPageConfig, content: string }
  | { type: 'card', id: string, config: CardPageConfig };

export default function Home() {
  const config = getConfig();
  const enableOnePageMode = config.features.enable_one_page_mode;

  // Always load about page config for profile info
  const aboutConfig = getPageConfig('about');
  const researchInterests = (aboutConfig as { profile?: { research_interests?: string[] } })?.profile?.research_interests;

  // Helper function to process sections (for about page)
  const processSections = (sections: SectionConfig[]) => {
    return sections.map((section: SectionConfig) => {
      switch (section.type) {
        case 'markdown':
          return {
            ...section,
            content: section.source ? getMarkdownContent(section.source) : ''
          };
        case 'publications': {
          const bibtex = getBibtexContent('publications.bib');
          const allPubs = parseBibTeX(bibtex);
          const filteredPubs = section.filter === 'selected'
            ? allPubs.filter(p => p.selected)
            : allPubs;
          return {
            ...section,
            publications: filteredPubs.slice(0, section.limit || 5)
          };
        }
        case 'list': {
          const newsData = section.source ? getTomlContent<{ news: NewsItem[] }>(section.source) : null;
          return {
            ...section,
            items: newsData?.news || []
          };
        }
        default:
          return section;
      }
    });
  };

  // Determine which pages to show
  let pagesToShow: PageData[] = [];

  if (enableOnePageMode) {
    pagesToShow = config.navigation
      .filter(item => item.type === 'page')
      .map(item => {
        const rawConfig = getPageConfig(item.target);
        if (!rawConfig) return null;

        const pageConfig = rawConfig as BasePageConfig;

        if (pageConfig.type === 'about' || 'sections' in (rawConfig as object)) {
          return {
            type: 'about',
            id: item.target,
            sections: processSections((rawConfig as { sections: SectionConfig[] }).sections || [])
          } as PageData;
        } else if (pageConfig.type === 'publication') {
          const pubConfig = pageConfig as PublicationPageConfig;
          const bibtex = getBibtexContent(pubConfig.source);
          return {
            type: 'publication',
            id: item.target,
            config: pubConfig,
            publications: parseBibTeX(bibtex)
          } as PageData;
        } else if (pageConfig.type === 'text') {
          const textConfig = pageConfig as TextPageConfig;
          return {
            type: 'text',
            id: item.target,
            config: textConfig,
            content: getMarkdownContent(textConfig.source)
          } as PageData;
        } else if (pageConfig.type === 'card') {
          return {
            type: 'card',
            id: item.target,
            config: pageConfig as CardPageConfig
          } as PageData;
        }
        return null;
      })
      .filter((item): item is PageData => item !== null);
  } else {
    if (aboutConfig) {
      pagesToShow = [{
        type: 'about',
        id: 'about',
        sections: processSections((aboutConfig as { sections: SectionConfig[] }).sections || [])
      }];
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <Profile
            author={config.author}
            social={config.social}
            features={config.features}
            researchInterests={researchInterests}
          />
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          {pagesToShow.map((page) => (
            <section key={page.id} id={page.id} className="scroll-mt-24 space-y-8">
              {page.type === 'about' && page.sections.map((section: SectionConfig) => {
                switch (section.type) {
                  case 'markdown':
                    return (
                      <About
                        key={section.id}
                        content={section.content || ''}
                        title={section.title}
                      />
                    );
                  case 'publications':
                    return (
                      <SelectedPublications
                        key={section.id}
                        publications={section.publications || []}
                        title={section.title}
                        enableOnePageMode={enableOnePageMode}
                      />
                    );
                  case 'list':
                    return (
                      <News
                        key={section.id}
                        items={section.items || []}
                        title={section.title}
                      />
                    );
                  default:
                    return null;
                }
              })}
              {page.type === 'publication' && (
                <PublicationsList
                  config={page.config}
                  publications={page.publications}
                  embedded={true}
                />
              )}
              {page.type === 'text' && (
                <TextPage
                  config={page.config}
                  content={page.content}
                  embedded={true}
                />
              )}
              {page.type === 'card' && (
                <CardPage
                  config={page.config}
                  embedded={true}
                />
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

