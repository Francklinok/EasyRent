import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Workflow steps for booking process
export type WorkflowStep =
  | 'property_selection'
  | 'visit_scheduling'
  | 'visit_confirmation'
  | 'visit_completed'
  | 'booking_form'
  | 'documents_upload'
  | 'owner_validation'
  | 'payment'
  | 'contract_generation'
  | 'completed';

export type WorkflowStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';

export interface BookingWorkflowState {
  bookingId?: string;
  propertyId?: string;
  currentStep: WorkflowStep;
  status: WorkflowStatus;
  completedSteps: WorkflowStep[];

  // Workflow data
  visitData?: {
    visitId: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected';
  };

  bookingData?: {
    startDate: string;
    endDate: string;
    numberOfOccupants: number;
    monthlyIncome: number;
    hasGuarantor: boolean;
    clientMessage?: string;
  };

  documentsData?: {
    uploaded: boolean;
    documentIds: string[];
    ownerApproval?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };

  paymentData?: {
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  };

  contractData?: {
    contractUrl?: string;
    signed: boolean;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface BookingWorkflowContextType {
  workflow: BookingWorkflowState | null;
  loading: boolean;

  // Workflow management
  initializeWorkflow: (propertyId: string) => Promise<void>;
  updateWorkflow: (updates: Partial<BookingWorkflowState>) => Promise<void>;
  completeStep: (step: WorkflowStep) => Promise<void>;
  goToStep: (step: WorkflowStep) => Promise<void>;
  canAccessStep: (step: WorkflowStep) => boolean;
  resetWorkflow: () => Promise<void>;

  // Step-specific actions
  setVisitData: (data: BookingWorkflowState['visitData']) => Promise<void>;
  setBookingData: (data: BookingWorkflowState['bookingData']) => Promise<void>;
  setDocumentsData: (data: BookingWorkflowState['documentsData']) => Promise<void>;
  setPaymentData: (data: BookingWorkflowState['paymentData']) => Promise<void>;
  setContractData: (data: BookingWorkflowState['contractData']) => Promise<void>;

  // Validation
  isStepCompleted: (step: WorkflowStep) => boolean;
  isWorkflowBlocked: () => boolean;
}

const BookingWorkflowContext = createContext<BookingWorkflowContextType | undefined>(undefined);

const STORAGE_KEY = '@booking_workflow';

// Step order
const STEP_ORDER: WorkflowStep[] = [
  'property_selection',
  'visit_scheduling',
  'visit_confirmation',
  'visit_completed',
  'booking_form',
  'documents_upload',
  'owner_validation',
  'payment',
  'contract_generation',
  'completed'
];

export const BookingWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflow, setWorkflow] = useState<BookingWorkflowState | null>(null);
  const [loading, setLoading] = useState(true);

  // Load workflow from storage on mount
  useEffect(() => {
    loadWorkflow();
  }, []);

  const loadWorkflow = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWorkflow(parsed);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkflow = async (state: BookingWorkflowState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const initializeWorkflow = useCallback(async (propertyId: string) => {
    const newWorkflow: BookingWorkflowState = {
      propertyId,
      currentStep: 'property_selection',
      status: 'in_progress',
      completedSteps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkflow(newWorkflow);
    await saveWorkflow(newWorkflow);
  }, []);

  const updateWorkflow = useCallback(async (updates: Partial<BookingWorkflowState>) => {
    if (!workflow) return;

    const updated: BookingWorkflowState = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setWorkflow(updated);
    await saveWorkflow(updated);
  }, [workflow]);

  const completeStep = useCallback(async (step: WorkflowStep) => {
    if (!workflow) return;

    const completedSteps = [...workflow.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }

    // Determine next step
    const currentIndex = STEP_ORDER.indexOf(step);
    const nextStep = STEP_ORDER[currentIndex + 1] || 'completed';

    await updateWorkflow({
      completedSteps,
      currentStep: nextStep as WorkflowStep
    });
  }, [workflow, updateWorkflow]);

  const goToStep = useCallback(async (step: WorkflowStep) => {
    if (!workflow) return;

    // Can only go to completed steps or the next step
    if (canAccessStep(step)) {
      await updateWorkflow({ currentStep: step });
    }
  }, [workflow, updateWorkflow]);

  const canAccessStep = useCallback((step: WorkflowStep): boolean => {
    if (!workflow) return false;

    // Can access completed steps
    if (workflow.completedSteps.includes(step)) return true;

    // Can access current step
    if (workflow.currentStep === step) return true;

    // Can't skip steps - check if previous step is completed
    const stepIndex = STEP_ORDER.indexOf(step);
    if (stepIndex === 0) return true;

    const previousStep = STEP_ORDER[stepIndex - 1];
    return workflow.completedSteps.includes(previousStep);
  }, [workflow]);

  const resetWorkflow = useCallback(async () => {
    setWorkflow(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const setVisitData = useCallback(async (data: BookingWorkflowState['visitData']) => {
    await updateWorkflow({ visitData: data });
  }, [updateWorkflow]);

  const setBookingData = useCallback(async (data: BookingWorkflowState['bookingData']) => {
    await updateWorkflow({ bookingData: data });
  }, [updateWorkflow]);

  const setDocumentsData = useCallback(async (data: BookingWorkflowState['documentsData']) => {
    await updateWorkflow({ documentsData: data });
  }, [updateWorkflow]);

  const setPaymentData = useCallback(async (data: BookingWorkflowState['paymentData']) => {
    await updateWorkflow({ paymentData: data });
  }, [updateWorkflow]);

  const setContractData = useCallback(async (data: BookingWorkflowState['contractData']) => {
    await updateWorkflow({ contractData: data });
  }, [updateWorkflow]);

  const isStepCompleted = useCallback((step: WorkflowStep): boolean => {
    return workflow?.completedSteps.includes(step) || false;
  }, [workflow]);

  const isWorkflowBlocked = useCallback((): boolean => {
    if (!workflow) return false;

    // Check if documents were rejected
    if (workflow.documentsData?.ownerApproval === 'rejected') return true;

    // Check if payment failed
    if (workflow.paymentData?.status === 'failed') return true;

    // Check if visit was rejected
    if (workflow.visitData?.status === 'rejected') return true;

    return false;
  }, [workflow]);

  const value: BookingWorkflowContextType = {
    workflow,
    loading,
    initializeWorkflow,
    updateWorkflow,
    completeStep,
    goToStep,
    canAccessStep,
    resetWorkflow,
    setVisitData,
    setBookingData,
    setDocumentsData,
    setPaymentData,
    setContractData,
    isStepCompleted,
    isWorkflowBlocked
  };

  return (
    <BookingWorkflowContext.Provider value={value}>
      {children}
    </BookingWorkflowContext.Provider>
  );
};

export const useBookingWorkflow = (): BookingWorkflowContextType => {
  const context = useContext(BookingWorkflowContext);
  if (!context) {
    throw new Error('useBookingWorkflow must be used within BookingWorkflowProvider');
  }
  return context;
};

export default BookingWorkflowContext;
