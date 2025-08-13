import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'reservation' | 'visit' | 'documents' | 'payment' | 'contract' | 'approval' | 'interest';
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'in_progress';
  timestamp: string;
  propertyId?: string;
  propertyTitle?: string;
  metadata?: {
    amount?: number;
    documentCount?: number;
    visitDate?: string;
    contractId?: string;
    [key: string]: any;
  };
}

interface ActivityContextType {
  activities: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  updateActivity: (id: string, updates: Partial<ActivityLog>) => void;
  getUserActivities: (userId: string) => ActivityLog[];
  getPropertyActivities: (propertyId: string) => ActivityLog[];
  clearUserActivities: (userId: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const addActivity = useCallback((activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activityData,
      id: 'activity-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    setActivities(prev => [newActivity, ...prev]);
    console.log('New activity logged:', newActivity);
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<ActivityLog>) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, ...updates, timestamp: new Date().toISOString() }
          : activity
      )
    );
  }, []);

  const getUserActivities = useCallback((userId: string) => {
    return activities
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities]);

  const getPropertyActivities = useCallback((propertyId: string) => {
    return activities
      .filter(activity => activity.propertyId === propertyId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities]);

  const clearUserActivities = useCallback((userId: string) => {
    setActivities(prev => prev.filter(activity => activity.userId !== userId));
  }, []);

  const value: ActivityContextType = {
    activities,
    addActivity,
    updateActivity,
    getUserActivities,
    getPropertyActivities,
    clearUserActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};