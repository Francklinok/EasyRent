export interface Reservation {
  propertyId: string;
  landlordId: string;
  reservationId:string,
  tenantId: string;
  startDate: any; // Timestamp ou Date
  endDate: any; // Timestamp ou Date
  monthlyRent: number;
  status: string;
  contractFileUri?: string;
  contractGenerationDate?: string;
}