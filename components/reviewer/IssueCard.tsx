
import React from 'react';
import { ReviewIssue } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface IssueCardProps {
  issue: ReviewIssue;
}

const severityConfig = {
  Critical: {
    color: 'bg-red-500',
    textColor: 'text-red-800 dark:text-red-200',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  High: {
    color: 'bg-orange-500',
    textColor: 'text-orange-800 dark:text-orange-200',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  Medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  Low: {
    color: 'bg-blue-500',
    textColor: 'text-blue-800 dark:text-blue-200',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  Info: {
    color: 'bg-gray-500',
    textColor: 'text-gray-800 dark:text-gray-200',
    bgColor: 'bg-gray-100 dark:bg-gray-700/30'
  }
};

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { t } = useLanguage();
  const config = severityConfig[issue.severity];

  return (
    <div className={`border-l-4 ${config.bgColor} rounded-r-lg shadow-sm overflow-hidden`} style={{ borderLeftColor: `var(--tw-color-${config.color})`}}>
        <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor}`}>
                        {issue.severity}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('category')}: {issue.category}</span>
                </div>
                {issue.lineNumber > 0 && 
                    <div className="mt-2 sm:mt-0 text-sm font-mono text-gray-500 dark:text-gray-400">
                       {t('lineNumber')}: {issue.lineNumber}
                    </div>
                }
            </div>

            <div className="mt-4 space-y-3">
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t('description')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{issue.description}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{t('suggestion')}</h4>
                    <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                        <code>{issue.suggestion}</code>
                    </pre>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IssueCard;
