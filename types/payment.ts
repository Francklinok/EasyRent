// Types pour la configuration des méthodes de paiement

export type PaymentMethodType = 'mobile_money' | 'bank_card' | 'paypal' | 'cash' | 'bank_transfer' | 'crypto' | 'other';

export interface PaymentMethodConfig {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  isConfigured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MobileMoneyConfig extends PaymentMethodConfig {
  type: 'mobile_money';
  country: string;
  countryCode: string;
  operator: string;
  phoneNumber: string;
  accountName?: string;
}

export interface BankCardConfig extends PaymentMethodConfig {
  type: 'bank_card';
  cardNumber: string; // Les 4 derniers chiffres seulement
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: 'visa' | 'mastercard' | 'amex';
}

export interface PayPalConfig extends PaymentMethodConfig {
  type: 'paypal';
  email: string;
  accountName?: string;
}

export type PaymentConfig = MobileMoneyConfig | BankCardConfig | PayPalConfig;

// Types pour le tracking des actions
// 'reservation' = paiement initial pour une location
// 'rent' = loyer mensuel
// 'service' = service souscrit
// 'sold' = achat immobilier
export type ActionType = 'reservation' | 'rent' | 'service' | 'sold';
export type ActionStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'accepted';

export interface UserAction {
  id: string;
  type: ActionType;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: ActionStatus;
  dueDate?: Date;
  createdAt: Date;
  metadata?: {
    propertyId?: string;
    propertyName?: string;
    serviceType?: string;
    reservationId?: string;
    rentId?: string;
    serviceId?: string;
    soldId?: string;
    rentPeriod?: string;
    subscriptionId?: string;
    invoiceId?: string;
    acceptedPaymentMethods?: PaymentMethodType[];
  };
}

// Opérateurs Mobile Money par pays
export interface MobileMoneyOperator {
  code: string;
  name: string;
  logo?: string;
  prefixes: string[]; // Préfixes de numéros acceptés
}

export interface CountryMobileMoneyConfig {
  countryCode: string;
  countryName: string;
  flag: string;
  operators: MobileMoneyOperator[];
}

export const MOBILE_MONEY_COUNTRIES: CountryMobileMoneyConfig[] = [
  {
    countryCode: 'CM',
    countryName: 'Cameroun',
    flag: '🇨🇲',
    operators: [
      {
        code: 'MTN',
        name: 'MTN Mobile Money',
        prefixes: ['67', '65', '68']
      },
      {
        code: 'ORANGE',
        name: 'Orange Money',
        prefixes: ['69', '65']
      },
      {
        code: 'EXPRESS_UNION',
        name: 'Express Union',
        prefixes: ['62']
      }
    ]
  },
  {
    countryCode: 'CI',
    countryName: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    operators: [
      {
        code: 'MTN',
        name: 'MTN Mobile Money',
        prefixes: ['05', '06', '07']
      },
      {
        code: 'ORANGE',
        name: 'Orange Money',
        prefixes: ['07', '08', '09']
      },
      {
        code: 'MOOV',
        name: 'Moov Money',
        prefixes: ['01', '02', '03']
      }
    ]
  },
  {
    countryCode: 'SN',
    countryName: 'Sénégal',
    flag: '🇸🇳',
    operators: [
      {
        code: 'ORANGE',
        name: 'Orange Money',
        prefixes: ['77', '78']
      },
      {
        code: 'FREE',
        name: 'Free Money',
        prefixes: ['76']
      },
      {
        code: 'WAVE',
        name: 'Wave',
        prefixes: ['70']
      }
    ]
  },
  {
    countryCode: 'FR',
    countryName: 'France',
    flag: '🇫🇷',
    operators: [
      {
        code: 'LYDIA',
        name: 'Lydia',
        prefixes: ['06', '07']
      },
      {
        code: 'PAYLIB',
        name: 'PayLib',
        prefixes: ['06', '07']
      }
    ]
  },
  {
    countryCode: 'TG',
    countryName: 'Togo',
    flag: '🇹🇬',
    operators: [
      {
        code: 'moov',
        name: 'Flooz',
        prefixes: ['99', '98','97','96','79']
      },
      {
        code: 'togocel',
        name: 'Miss by yass',
        prefixes: ['90', '91','92','93','70','71' ]
      },
      
    ]
  },
];
