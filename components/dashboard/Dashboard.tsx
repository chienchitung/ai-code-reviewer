
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XIcon } from '../ui/Icons';
import { Review, ReviewIssue, Severity } from '../../types';
import ReviewResults from '../reviewer/ReviewResults';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

interface DashboardProps {
    reviews: Review[];
}

const Dashboard: React.FC<DashboardProps> = ({ reviews }) => {
    const { t } = useLanguage();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{t('dashboardTitle')}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">{t('noReviewsMessage')}</p>
            </div>
        )
    }

    const latestReview = reviews[0];

    // Calculate stats
    const issuesFound = latestReview.issues.length;
    const vulnerabilities = latestReview.issues.filter(i => i.category.toLowerCase().includes('security')).length;
    
    const qualityScoreValue = Math.max(0, 100 - latestReview.issues.reduce((score, issue) => {
        if (issue.severity === 'Critical') return score + 10;
        if (issue.severity === 'High') return score + 5;
        if (issue.severity === 'Medium') return score + 2;
        if (issue.severity === 'Low') return score + 1;
        return score;
    }, 0));
    
    const performanceIssues = latestReview.issues.filter(i => i.category.toLowerCase().includes('performance')).length;
    const performanceScoreValue = Math.max(0, 100 - (performanceIssues * 10));

    // Chart data
    const severityMap: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
    latestReview.issues.forEach(issue => {
        if (severityMap[issue.severity] !== undefined) {
           severityMap[issue.severity]++;
        }
    });
    const severityData = [
        { name: t('critical'), issues: severityMap['Critical'], fill: '#ef4444' },
        { name: t('high'), issues: severityMap['High'], fill: '#f97316' },
        { name: t('medium'), issues: severityMap['Medium'], fill: '#eab308' },
        { name: t('low'), issues: severityMap['Low'], fill: '#3b82f6' },
    ];
    
    const trendData = [...reviews].reverse().slice(-10).map((review, index) => {
        const score = Math.max(0, 100 - review.issues.reduce((s, issue) => {
            if (issue.severity === 'Critical') return s + 10;
            if (issue.severity === 'High') return s + 5;
            if (issue.severity === 'Medium') return s + 2;
            if (issue.severity === 'Low') return s + 1;
            return s;
        }, 0));
        return { name: `v${index + 1}`, score };
    });

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dashboardTitle')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('codeQualityScore')} value={`${qualityScoreValue}%`} icon={<CheckCircleIcon className="w-6 h-6 text-white" />} color="bg-green-500" />
                <StatCard title={t('issuesFound')} value={issuesFound} icon={<ExclamationCircleIcon className="w-6 h-6 text-white" />} color="bg-yellow-500" />
                <StatCard title={t('vulnerabilities')} value={vulnerabilities} icon={<ExclamationCircleIcon className="w-6 h-6 text-white" />} color="bg-red-500" />
                <StatCard title={t('performanceScore')} value={`${performanceScoreValue}%`} icon={<InformationCircleIcon className="w-6 h-6 text-white" />} color="bg-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">{t('issueDistribution')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={severityData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} labelStyle={{ color: '#e5e7eb' }}/>
                            <Bar dataKey="issues" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">{t('qualityTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis domain={[0, 100]} className="text-xs" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} labelStyle={{ color: '#e5e7eb' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">{t('recentReviews')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('date')}</th>
                                <th scope="col" className="px-6 py-3">{t('language')}</th>
                                <th scope="col" className="px-6 py-3">{t('issues')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.slice(0, 5).map(review => (
                                <tr key={review.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{new Date(review.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">{review.language}</td>
                                    <td className="px-6 py-4">{review.issues.length}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setSelectedReview(review)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">{t('viewReport')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReview && (
                 <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedReview(null)}
                >
                    <div 
                        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
                                {t('analysisResults')}
                            </h3>
                            <button 
                                type="button" 
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={() => setSelectedReview(null)}
                            >
                                <XIcon className="w-5 h-5" />
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                           <ReviewResults report={selectedReview.report} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
