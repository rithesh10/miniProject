import { Play, Moon, Sun } from 'lucide-react';

interface ToolbarProps {
  onRun: () => void;
  onThemeToggle: () => void;
  theme: 'vs-dark' | 'light';
  isRunning: boolean;
  language: string;
}

export default function Toolbar({ onRun, onThemeToggle, theme, isRunning, language }: ToolbarProps) {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'JavaScript';
      case 'python': return 'Python';
      case 'java': return 'Java';
      default: return 'Unknown';
    }
  };

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Online IDE</h1>
        <div className="text-sm text-gray-400">
          {language && `Current: ${getLanguageLabel(language)}`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            isRunning
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Play size={16} />
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button
          onClick={onThemeToggle}
          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
          title="Toggle theme"
        >
          {theme === 'vs-dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
