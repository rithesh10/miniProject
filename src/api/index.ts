import { FileType, Workspace, ExecutionResult } from '../types';

const API_URL = 'http://localhost:5000/api';

export const api = {
  workspaces: {
    getAll: async (): Promise<Workspace[]> => {
      const response = await fetch(`${API_URL}/workspaces`);
      return response.json();
    },
    getById: async (id: string): Promise<Workspace> => {
      const response = await fetch(`${API_URL}/workspaces/${id}`);
      return response.json();
    },
    create: async (name?: string): Promise<Workspace> => {
      const response = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return response.json();
    },
    update: async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
      const response = await fetch(`${API_URL}/workspaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  files: {
    getAll: async (workspaceId: string): Promise<FileType[]> => {
      const response = await fetch(`${API_URL}/files?workspaceId=${workspaceId}`);
      return response.json();
    },
    getById: async (id: string): Promise<FileType> => {
      const response = await fetch(`${API_URL}/files/${id}`);
      return response.json();
    },
    create: async (data: { name: string; language: string; workspaceId: string }): Promise<FileType> => {
      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    update: async (id: string, data: Partial<FileType>): Promise<FileType> => {
      const response = await fetch(`${API_URL}/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`${API_URL}/files/${id}`, { method: 'DELETE' });
    },
  },
  execute: async (code: string, language: string): Promise<ExecutionResult> => {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    return response.json();
  },
};
