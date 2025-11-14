import { useState, useEffect, useCallback } from 'react';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import OutputTerminal from './components/OutputTerminal';
import Toolbar from './components/Toolbar';
import Toast from './components/Toast';
import { api } from './api';
import { FileType, Workspace } from './types';

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [activeFile, setActiveFile] = useState<FileType | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      const workspaces = await api.workspaces.getAll();
      let currentWorkspace: Workspace;

      if (workspaces.length === 0) {
        currentWorkspace = await api.workspaces.create('My Workspace');
      } else {
        currentWorkspace = workspaces[0];
      }

      setWorkspace(currentWorkspace);
      await loadFiles(currentWorkspace._id);
    } catch (error) {
      showToast('Failed to initialize workspace', 'error');
      console.error(error);
    }
  };

  const loadFiles = async (workspaceId: string) => {
    try {
      const loadedFiles = await api.files.getAll(workspaceId);
      setFiles(loadedFiles);

      if (loadedFiles.length > 0) {
        setActiveFile(loadedFiles[0]);
      }
    } catch (error) {
      showToast('Failed to load files', 'error');
      console.error(error);
    }
  };

  const handleFileSelect = (file: FileType) => {
    setActiveFile(file);
  };

  const handleFileCreate = async (name: string, language: 'javascript' | 'python' | 'java') => {
    if (!workspace) return;

    try {
      const newFile = await api.files.create({
        name,
        language,
        workspaceId: workspace._id,
      });
      setFiles([...files, newFile]);
      setActiveFile(newFile);
      showToast('File created successfully', 'success');
    } catch (error) {
      showToast('Failed to create file', 'error');
      console.error(error);
    }
  };

  const handleFileRename = async (id: string, newName: string) => {
    try {
      const updatedFile = await api.files.update(id, { name: newName });
      setFiles(files.map(f => f._id === id ? updatedFile : f));
      if (activeFile?._id === id) {
        setActiveFile(updatedFile);
      }
      showToast('File renamed successfully', 'success');
    } catch (error) {
      showToast('Failed to rename file', 'error');
      console.error(error);
    }
  };

  const handleFileDelete = async (id: string) => {
    try {
      await api.files.delete(id);
      const newFiles = files.filter(f => f._id !== id);
      setFiles(newFiles);

      if (activeFile?._id === id) {
        setActiveFile(newFiles.length > 0 ? newFiles[0] : null);
      }

      showToast('File deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete file', 'error');
      console.error(error);
    }
  };

  const handleEditorChange = useCallback((value: string) => {
    if (activeFile) {
      setActiveFile({ ...activeFile, content: value });
      setPendingSave(true);
    }
  }, [activeFile]);

  useEffect(() => {
    if (pendingSave && activeFile) {
      const timer = setTimeout(async () => {
        try {
          await api.files.update(activeFile._id, { content: activeFile.content });
          setFiles(files.map(f => f._id === activeFile._id ? activeFile : f));
          setPendingSave(false);
        } catch (error) {
          console.error('Autosave failed:', error);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [activeFile, pendingSave, files]);

  const handleRunCode = async () => {
    if (!activeFile) {
      showToast('No file selected', 'error');
      return;
    }

    setIsRunning(true);
    setOutput('Running...');
    setIsError(false);

    try {
      const result = await api.execute(activeFile.content, activeFile.language);
      setOutput(result.output);
      setIsError(!result.success);
    } catch (error) {
      setOutput('Failed to execute code');
      setIsError(true);
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  const handleClearOutput = () => {
    setOutput('');
    setIsError(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar
        onRun={handleRunCode}
        onThemeToggle={handleThemeToggle}
        theme={theme}
        isRunning={isRunning}
        language={activeFile?.language || ''}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          activeFileId={activeFile?._id || null}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileRename={handleFileRename}
          onFileDelete={handleFileDelete}
        />

        <div className="flex-1 flex flex-col">
          <Editor
            file={activeFile}
            theme={theme}
            onChange={handleEditorChange}
          />
          <OutputTerminal
            output={output}
            isError={isError}
            onClear={handleClearOutput}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
