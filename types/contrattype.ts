import { Property } from '@/types/property';
import { User } from '@/types/userType';
import { Reservation } from '@/types/reservationType';

export type GenerateParams = {
    reservation: Reservation;
    property: Property;
    landlord: User;
    tenant: User;
    contractId: string;
    formatDate: (date: any) => Date;
  };