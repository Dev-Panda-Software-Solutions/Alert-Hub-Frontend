import React from 'react';
import type { ReminderModule } from '../../types';

const STYLES: Record<ReminderModule, string> = {
  BUSINESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  FAMILY:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  FINANCE:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

interface ModuleTagProps {
  module: ReminderModule;
}

const ModuleTag: React.FC<ModuleTagProps> = ({ module }) => (
  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${STYLES[module]}`}>
    {module}
  </span>
);

export default ModuleTag;
