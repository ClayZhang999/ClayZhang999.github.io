'use client';

import { motion } from 'framer-motion';
import { PdfPageConfig } from '@/types/page';

interface PdfPageProps {
    config: PdfPageConfig;
}

export default function PdfPage({ config }: PdfPageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full"
        >
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">{config.title}</h1>
            {config.description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-500 mb-8 max-w-2xl">
                    {config.description}
                </p>
            )}
            <div className="w-full rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <iframe
                    src={config.source}
                    className="w-full bg-white"
                    style={{ height: config.height || '800px' }}
                    title={config.title}
                />
            </div>
            {config.downloadable !== false && (
                <div className="mt-4">
                    <a
                        href={config.source}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download PDF
                    </a>
                </div>
            )}
        </motion.div>
    );
}
