import { Reservation } from "./reservationType";
import { Property } from "./property";
import { User } from "./userType";

// export type GenerateContractParams = {
//     reservation: Reservation | null;
//     property: Property | null;
//     landlord: User | null;
//     tenant: User | null;
//     contractId: string;
//     contractFileUri: string | null;
//     errorMessage: string | null;
//     loading: boolean;
//     generating: boolean;
//     formatDate: (date: any) => Date;
//     setReservation: React.Dispatch<React.SetStateAction<Reservation | null>>;
//     setProperty: React.Dispatch<React.SetStateAction<Property | null>>;
//     setLandlord: React.Dispatch<React.SetStateAction<User | null>>;
//     setTenant: React.Dispatch<React.SetStateAction<User | null>>;
//     setContractFileUri: React.Dispatch<React.SetStateAction<string | null>>;
//     setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
//     setLoading: React.Dispatch<React.SetStateAction<boolean>>;
//     setGenerating: React.Dispatch<React.SetStateAction<boolean>>;
//   };
  import React from "react";

  type ContractId = string;

export type GenerateContractParams = {
  reservation?: Reservation | null;
  property?: Property | null;
  landlord?: User | null;
  tenant?: User | null;
  contractId: ContractId;
  contractFileUri?: string | null;
  errorMessage?: string | null;
  loading?: boolean;
  generating?: boolean;
  formatDate: (date: any) => Date;
  setReservation?: React.Dispatch<React.SetStateAction<Reservation | null>>;
  setProperty?: React.Dispatch<React.SetStateAction<Property | null>>;
  setLandlord?: React.Dispatch<React.SetStateAction<User | null>>;
  setTenant?: React.Dispatch<React.SetStateAction<User | null>>;
  setContractFileUri?: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorMessage?: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setGenerating?: React.Dispatch<React.SetStateAction<boolean>>;
  setContractId?: React.Dispatch<React.SetStateAction<ContractId>>
};

  
  