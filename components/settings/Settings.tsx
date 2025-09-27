import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { GitHubIcon, GitLabIcon, BitbucketIcon } from '../ui/Icons';

type ToggleProps = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const ToggleSwitch: React.FC<ToggleProps> = ({ enabled, setEnabled }) => {
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 ${
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
      }`}
      aria-pressed={enabled}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const SettingsCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-3 dark:border-gray-700">{title}</h3>
    {children}
  </div>
);

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [threshold, setThreshold] = useState('high');
  const [excluded, setExcluded] = useState('node_modules/\nbuild/\ndist/\n*.test.js');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }, 1000);
  };
  
  const commonInputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";
  const commonLabelClasses = "block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300";
  const commonDescriptionClasses = "text-xs text-gray-500 dark:text-gray-400 mt-1";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('settingsTitle')}</h2>

      <SettingsCard title={t('analysisSettings')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="severity-threshold" className={commonLabelClasses}>{t('severityThreshold')}</label>
            <select id="severity-threshold" value={threshold} onChange={e => setThreshold(e.target.value)} className={commonInputClasses}>
              <option value="critical">{t('critical')}</option>
              <option value="high">{t('high')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="low">{t('low')}</option>
            </select>
            <p className={commonDescriptionClasses}>{t('blockDeploymentOn')}</p>
          </div>
          <div>
            <label htmlFor="excluded-files" className={commonLabelClasses}>{t('excludedFilesAndFolders')}</label>
            <textarea id="excluded-files" rows={4} value={excluded} onChange={e => setExcluded(e.target.value)} className={`${commonInputClasses} font-mono`} />
             <p className={commonDescriptionClasses}>{t('excludedFilesDescription')}</p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title={t('integrations')}>
        <div className="space-y-3">
            {[
                { name: t('connectToGitHub'), icon: GitHubIcon },
                { name: t('connectToGitLab'), icon: GitLabIcon },
                { name: t('connectToBitbucket'), icon: BitbucketIcon },
            ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                        <item.icon className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-300" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                    </div>
                    <button disabled className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-400 dark:bg-gray-600 rounded-md cursor-not-allowed opacity-70">
                        {t('comingSoon')}
                    </button>
                </div>
            ))}
        </div>
      </SettingsCard>

      <SettingsCard title={t('notifications')}>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={commonLabelClasses}>{t('enableEmailNotifications')}</label>
              <ToggleSwitch enabled={emailNotifications} setEnabled={setEmailNotifications} />
            </div>
            <div>
              <label htmlFor="slack-url" className={commonLabelClasses}>{t('slackWebhookURL')}</label>
              <input type="text" id="slack-url" className={commonInputClasses} placeholder="https://hooks.slack.com/services/..." disabled />
            </div>
             <div>
              <label htmlFor="teams-url" className={commonLabelClasses}>{t('teamsWebhookURL')}</label>
              <input type="text" id="teams-url" className={commonInputClasses} placeholder="https://your-tenant.webhook.office.com/..." disabled />
            </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end items-center gap-4 pt-4">
          {showSuccess && <span className="text-sm text-green-600 dark:text-green-400">{t('changesSaved')}</span>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-primary-700 focus:bg-primary-700 focus:outline-none focus:ring-0 active:bg-primary-800 transition duration-150 ease-in-out disabled:opacity-50"
          >
            {isSaving ? `${t('loading')}...` : t('saveChanges')}
          </button>
      </div>
    </div>
  );
};

export default Settings;
