import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentConfig, MobileMoneyConfig, BankCardConfig, PayPalConfig, PaymentMethodType } from '@/types/payment';

const STORAGE_KEYS = {
  MOBILE_MONEY: '@wallet_mobile_money_config',
  BANK_CARD: '@wallet_bank_card_config',
  PAYPAL: '@wallet_paypal_config',
  DEFAULT_METHOD: '@wallet_default_method'
};

class PaymentConfigService {
  // Récupère toutes les configurations
  async getAllConfigs(): Promise<PaymentConfig[]> {
    try {
      const configs: PaymentConfig[] = [];
      
      const mobileMoneyJson = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE_MONEY);
      const bankCardJson = await AsyncStorage.getItem(STORAGE_KEYS.BANK_CARD);
      const paypalJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYPAL);
      
      if (mobileMoneyJson) configs.push(JSON.parse(mobileMoneyJson));
      if (bankCardJson) configs.push(JSON.parse(bankCardJson));
      if (paypalJson) configs.push(JSON.parse(paypalJson));
      
      return configs;
    } catch (error) {
      console.error('Error getting all configs:', error);
      return [];
    }
  }

  // Récupère la configuration Mobile Money
  async getMobileMoneyConfig(): Promise<MobileMoneyConfig | null> {
    try {
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE_MONEY);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error getting mobile money config:', error);
      return null;
    }
  }

  // Sauvegarde la configuration Mobile Money
  async saveMobileMoneyConfig(config: Omit<MobileMoneyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<MobileMoneyConfig> {
    try {
      const existingConfig = await this.getMobileMoneyConfig();
      
      const newConfig: MobileMoneyConfig = {
        ...config,
        id: existingConfig?.id || `mm_${Date.now()}`,
        createdAt: existingConfig?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.MOBILE_MONEY, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Error saving mobile money config:', error);
      throw error;
    }
  }

  // Récupère la configuration Carte Bancaire
  async getBankCardConfig(): Promise<BankCardConfig | null> {
    try {
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.BANK_CARD);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error getting bank card config:', error);
      return null;
    }
  }

  // Sauvegarde la configuration Carte Bancaire
  async saveBankCardConfig(config: Omit<BankCardConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankCardConfig> {
    try {
      const existingConfig = await this.getBankCardConfig();
      
      const newConfig: BankCardConfig = {
        ...config,
        id: existingConfig?.id || `bc_${Date.now()}`,
        createdAt: existingConfig?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.BANK_CARD, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Error saving bank card config:', error);
      throw error;
    }
  }

  // Récupère la configuration PayPal
  async getPayPalConfig(): Promise<PayPalConfig | null> {
    try {
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYPAL);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error getting PayPal config:', error);
      return null;
    }
  }

  // Sauvegarde la configuration PayPal
  async savePayPalConfig(config: Omit<PayPalConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayPalConfig> {
    try {
      const existingConfig = await this.getPayPalConfig();
      
      const newConfig: PayPalConfig = {
        ...config,
        id: existingConfig?.id || `pp_${Date.now()}`,
        createdAt: existingConfig?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.PAYPAL, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Error saving PayPal config:', error);
      throw error;
    }
  }

  // Définit la méthode par défaut
  async setDefaultMethod(methodType: PaymentMethodType): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_METHOD, methodType);
      
      // Met à jour les configs
      const configs = await this.getAllConfigs();
      for (const config of configs) {
        config.isDefault = config.type === methodType;
        await this.saveConfig(config);
      }
    } catch (error) {
      console.error('Error setting default method:', error);
      throw error;
    }
  }

  // Récupère la méthode par défaut
  async getDefaultMethod(): Promise<PaymentMethodType | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_METHOD) as PaymentMethodType | null;
    } catch (error) {
      console.error('Error getting default method:', error);
      return null;
    }
  }

  // Supprime une configuration
  async deleteConfig(methodType: PaymentMethodType): Promise<void> {
    try {
      const key = this.getStorageKey(methodType);
      await AsyncStorage.removeItem(key);
      
      // Si c'était la méthode par défaut, on la retire
      const defaultMethod = await this.getDefaultMethod();
      if (defaultMethod === methodType) {
        await AsyncStorage.removeItem(STORAGE_KEYS.DEFAULT_METHOD);
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      throw error;
    }
  }

  // Helper pour sauvegarder une config
  private async saveConfig(config: PaymentConfig): Promise<void> {
    const key = this.getStorageKey(config.type);
    await AsyncStorage.setItem(key, JSON.stringify(config));
  }

  // Helper pour obtenir la clé de stockage
  private getStorageKey(methodType: PaymentMethodType): string {
    switch (methodType) {
      case 'mobile_money':
        return STORAGE_KEYS.MOBILE_MONEY;
      case 'bank_card':
        return STORAGE_KEYS.BANK_CARD;
      case 'paypal':
        return STORAGE_KEYS.PAYPAL;
    }
  }
}

export const paymentConfigService = new PaymentConfigService();
