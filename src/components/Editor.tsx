import MonacoEditor from '@monaco-editor/react';
import { FileType } from '../types';

interface EditorProps {
  file: FileType | null;
  theme: 'vs-dark' | 'light';
  onChange: (value: string) => void;
}

export default function Editor({ file, theme, onChange }: EditorProps) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">No file selected</p>
          <p className="text-sm">Create or select a file to start coding</p>
        </div>
      </div>
    );
  }

  const getLanguageMode = (language: string) => {
    switch (language) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'java': return 'java';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-gray-200 text-sm">
        {file.name}.{file.language === 'javascript' ? 'js' : file.language === 'python' ? 'py' : 'java'}
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={getLanguageMode(file.language)}
          value={file.content}
          theme={theme}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
