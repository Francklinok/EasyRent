import React, { createContext, useContext, useState, useCallback } from 'react';

export interface BookingReservation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  landlordId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  numberOfOccupants: number;
  hasGuarantor: boolean;
  monthlyIncome: number;
  status: 'pending' | 'documents_submitted' | 'approved' | 'rejected' | 'payment_pending' | 'payment_completed' | 'contract_generated' | 'completed';
  documentsSubmitted: boolean;
  documentsApproved: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: string[];
  visitCompleted?: boolean;
}

interface BookingContextType {
  reservations: BookingReservation[];
  addReservation: (reservation: Omit<BookingReservation, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateReservationStatus: (id: string, status: BookingReservation['status']) => void;
  updateReservationDocuments: (id: string, documents: string[], submitted: boolean) => void;
  approveReservation: (id: string, ownerId: string) => void;
  rejectReservation: (id: string, ownerId: string, reason?: string) => void;
  getReservation: (id: string) => BookingReservation | undefined;
  getUserReservations: (userId: string) => BookingReservation[];
  getOwnerReservations: (ownerId: string) => BookingReservation[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<BookingReservation[]>([]);

  const addReservation = useCallback((reservationData: Omit<BookingReservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReservation: BookingReservation = {
      ...reservationData,
      id: 'booking-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setReservations(prev => [newReservation, ...prev]);
    console.log('New reservation added:', newReservation);
    return newReservation.id;
  }, []);

  const updateReservationStatus = useCallback((id: string, status: BookingReservation['status']) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id 
          ? { ...reservation, status, updatedAt: new Date().toISOString() }
          : reservation
      )
    );
  }, []);

  const updateReservationDocuments = useCallback((id: string, documents: string[], submitted: boolean) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id 
          ? { 
              ...reservation, 
              documents, 
              documentsSubmitted: submitted,
              status: submitted ? 'documents_submitted' : reservation.status,
              updatedAt: new Date().toISOString() 
            }
          : reservation
      )
    );
  }, []);

  const getReservation = useCallback((id: string) => {
    return reservations.find(reservation => reservation.id === id);
  }, [reservations]);

  const getUserReservations = useCallback((userId: string) => {
    return reservations.filter(reservation => reservation.tenantId === userId);
  }, [reservations]);

  const getOwnerReservations = useCallback((ownerId: string) => {
    return reservations.filter(reservation => reservation.landlordId === ownerId);
  }, [reservations]);

  const approveReservation = useCallback((id: string, ownerId: string) => {
    setReservations(prev => 
      prev.map(reservation => {
        if (reservation.id === id && reservation.landlordId === ownerId) {
          return { 
            ...reservation, 
            status: 'approved',
            documentsApproved: true,
            updatedAt: new Date().toISOString() 
          };
        }
        return reservation;
      })
    );
  }, []);

  const rejectReservation = useCallback((id: string, ownerId: string, reason?: string) => {
    setReservations(prev => 
      prev.map(reservation => {
        if (reservation.id === id && reservation.landlordId === ownerId) {
          return { 
            ...reservation, 
            status: 'rejected',
            updatedAt: new Date().toISOString() 
          };
        }
        return reservation;
      })
    );
  }, []);

  const value: BookingContextType = {
    reservations,
    addReservation,
    updateReservationStatus,
    updateReservationDocuments,
    approveReservation,
    rejectReservation,
    getReservation,
    getUserReservations,
    getOwnerReservations
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};