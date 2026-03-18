import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getBookingService, BookingRequest, Booking } from '@/services/api/bookingService';
import { useNotifications } from '../notifications/NotificationContext';

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
  isLoading: boolean;
  error: string | null;
  // Actions "Connectées" (API + State)
  fetchUserReservations: (userId: string) => Promise<void>;
  createBooking: (userId: string, request: BookingRequest, propertyTitle: string, listType?: 'rent' | 'sale') => Promise<string>;

  // Actions legacy / locales (à migrer idéalement)
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingService = getBookingService();
  const { addNotification } = useNotifications();

  // Mapper le type "Booking" (API) vers "BookingReservation" (Context)
  const mapApiBookingToContext = (apiBooking: Booking): BookingReservation => {
    return {
      id: apiBooking.id,
      propertyId: apiBooking.propertyId,
      propertyTitle: apiBooking.propertyTitle,
      landlordId: apiBooking.ownerId,
      tenantId: apiBooking.clientId,
      startDate: apiBooking.startDate,
      endDate: apiBooking.endDate,
      monthlyRent: apiBooking.monthlyRent || apiBooking.salePrice || 0,
      depositAmount: apiBooking.depositAmount || 0,
      numberOfOccupants: apiBooking.numberOfOccupants,
      hasGuarantor: apiBooking.hasGuarantor,
      monthlyIncome: apiBooking.monthlyIncome,
      status: apiBooking.status as BookingReservation['status'], // Attention au casting si les statuts diffèrent
      documentsSubmitted: apiBooking.documentsSubmitted,
      documentsApproved: apiBooking.documentsApproved,
      documents: apiBooking.documents?.map(d => d.url) || [],
      visitCompleted: apiBooking.visitCompleted,
      createdAt: apiBooking.createdAt,
      updatedAt: apiBooking.updatedAt
    };
  };

  const fetchUserReservations = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Note: Il faudrait ajouter une méthode getBookingsForUser dans le service
      // Pour l'instant, on simule ou on utilise ce qui existe
      // const apiReservations = await bookingService.getUserBookings(userId);
      // setReservations(apiReservations.map(mapApiBookingToContext));
      console.log('Fetching reservations from API for user:', userId);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Nouvelle méthode "Professionnelle" : Appelle l'API puis met à jour le state local
  const createBooking = useCallback(async (
    userId: string,
    request: BookingRequest,
    propertyTitle: string,
    listType?: 'rent' | 'sale'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Appel API
      const newBooking = await bookingService.createBooking(request, propertyTitle, undefined, listType);

      // 2. Mise à jour du State Local (Single Source of Truth)
      const contextBooking = mapApiBookingToContext(newBooking);
      setReservations(prev => [contextBooking, ...prev]);

      return newBooking.id;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- MÉTODES EXISTANTES (Gardées pour compatibilité) ---

  const addReservation = useCallback((reservationData: Omit<BookingReservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReservation: BookingReservation = {
      ...reservationData,
      id: 'booking-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReservations(prev => [newReservation, ...prev]);
    console.warn('⚠️ [BookingContext] addReservation (local only) called. Use createBooking for API sync.');
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
    // TODO: Appeler bookingService.updateStatus(id, status) ici
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
    isLoading,
    error,
    fetchUserReservations,
    createBooking,
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