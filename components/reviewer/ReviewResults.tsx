import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface ReviewResultsProps {
  report: string;
}

const ReviewResults: React.FC<ReviewResultsProps> = ({ report }) => {
  const { t } = useLanguage();

  if (!report.trim()) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('analysisResults')}</h3>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noIssues')}</p>
        </div>
      </div>
    );
  }

  // This is not a full markdown parser. It's designed to format the AI's output.
  const formattedHtml = report
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto my-4 font-mono text-sm">${code}</pre>`;
    })
    // Headings
    .replace(/^###\s(.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^##\s(.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-4 pb-2 border-b dark:border-gray-600">$1</h2>')
    .replace(/^#\s(.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4 pb-2 border-b dark:border-gray-600">$1</h1>')
    // Lists
    .replace(/(?:^\s*[-*]\s(?:.*)\n?)+/gm, (match) => {
        const items = match.trim().split('\n').map(item => `<li>${item.replace(/^\s*[-*]\s/, '')}</li>`).join('');
        return `<ul class="list-disc pl-5 space-y-1 my-4">${items}</ul>`;
    })
    // Bold and inline code
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 font-mono text-sm">$1</code>')
    // Paragraphs
    .split('\n')
    .map(line => {
        if (line.trim() === '') return '';
        if (line.startsWith('<')) return line;
        return `<p>${line}</p>`;
    })
    .join('');


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t('analysisResults')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('feedbackByGemini')}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md leading-relaxed">
        <div className="space-y-2" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
      </div>
    </div>
  );
};

export default ReviewResults;
