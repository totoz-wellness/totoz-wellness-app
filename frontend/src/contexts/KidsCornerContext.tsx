// ============================================
// KIDSCORNER CONTEXT
// ============================================
// @version     1.0.0
// @author      ArogoClin
// @updated     2026-02-10
// @description Global state management for KidsCorner multi-child support
// ============================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as kidsCornerAPI from '../services/kidscorner.service';
import { Child, ChildProgress } from '../services/kidscorner.service';

interface KidsCornerContextType {
  // Children Management
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
  
  // Loading States
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchChildren: () => Promise<void>;
  createNewChild: (name: string, age: number, avatarEmoji?: string) => Promise<Child | null>;
  updateChildData: (childId: string, updates: Partial<Child>) => Promise<void>;
  
  // Progress (for active child)
  progress: ChildProgress | null;
  refreshProgress: () => Promise<void>;
}

const KidsCornerContext = createContext<KidsCornerContextType | undefined>(undefined);

export const KidsCornerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all children on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchChildren();
    }
  }, []);

  // Fetch children from backend
  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await kidsCornerAPI.getChildren();
      setChildrenList(data);
      
      // Auto-select first child if none selected
      if (data.length > 0 && !activeChild) {
        setActiveChildState(data[0]);
      }
      
      // Update active child if it was already selected
      if (activeChild) {
        const updated = data.find(c => c.id === activeChild.id);
        if (updated) {
          setActiveChildState(updated);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch children:', err);
      setError(err.response?.data?.message || 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  // Create new child
  const createNewChild = async (
    name: string, 
    age: number, 
    avatarEmoji: string = '😊'
  ): Promise<Child | null> => {
    try {
      setLoading(true);
      setError(null);
      const newChild = await kidsCornerAPI.createChild({ name, age, avatarEmoji });
      
      // Refresh children list
      await fetchChildren();
      
      // Auto-select new child
      setActiveChildState(newChild);
      
      return newChild;
    } catch (err: any) {
      console.error('Failed to create child:', err);
      setError(err.response?.data?.message || 'Failed to create child profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update child data
  const updateChildData = async (childId: string, updates: Partial<Child>) => {
    try {
      setLoading(true);
      await kidsCornerAPI.updateChild(childId, updates);
      await fetchChildren(); // Refresh list
    } catch (err: any) {
      console.error('Failed to update child:', err);
      setError(err.response?.data?.message || 'Failed to update child');
    } finally {
      setLoading(false);
    }
  };

  // Set active child and load their progress
  const setActiveChild = async (child: Child | null) => {
    setActiveChildState(child);
    
    if (child) {
      // Store in localStorage for persistence
      localStorage.setItem('activeChildId', child.id);
      
      // Fetch fresh progress
      await refreshProgress(child.id);
    } else {
      localStorage.removeItem('activeChildId');
      setProgress(null);
    }
  };

  // Refresh progress for active child
  const refreshProgress = async (childId?: string) => {
    const targetChildId = childId || activeChild?.id;
    
    if (!targetChildId) return;
    
    try {
      const data = await kidsCornerAPI.getProgress(targetChildId);
      setProgress(data.progress);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  // Restore active child from localStorage on mount
  useEffect(() => {
    const savedChildId = localStorage.getItem('activeChildId');
    if (savedChildId && childrenList.length > 0) {
      const child = childrenList.find(c => c.id === savedChildId);
      if (child) {
        setActiveChildState(child);
        refreshProgress(child.id);
      }
    }
  }, [childrenList]);

  return (
    <KidsCornerContext.Provider
      value={{
        children: childrenList,
        activeChild,
        setActiveChild,
        loading,
        error,
        fetchChildren,
        createNewChild,
        updateChildData,
        progress,
        refreshProgress
      }}
    >
      {children}
    </KidsCornerContext.Provider>
  );
};

// Custom hook
export const useKidsCorner = () => {
  const context = useContext(KidsCornerContext);
  if (!context) {
    throw new Error('useKidsCorner must be used within KidsCornerProvider');
  }
  return context;
};