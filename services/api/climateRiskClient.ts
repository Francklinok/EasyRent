/**
 * ClimateRiskClient — typed client for the climate risk transparency module
 * (backend_easyrent/src/climateRisk/, mounted at /api/climate-risk, bridging
 * to property-engine's climate_risk_service in Rust). Each record is
 * explicitly labeled historical_record or estimate — never a single opaque
 * score — so the UI can render the fact/estimate distinction rather than
 * collapsing it into one number.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/apiConfig';

export type HazardType = 'flood' | 'erosion' | 'drought' | 'wildfire' | 'sea_level_rise' | 'landslide' | 'extreme_heat' | 'other';
export type ClimateDataType = 'historical_record' | 'estimate';
export type ClimateRiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface ClimateRiskRecord {
  record_id: string;
  hazard_type: HazardType;
  data_type: ClimateDataType;
  risk_level: ClimateRiskLevel;
  description: string;
  source: string;
  confidence_pct?: number;
  margin_of_error_note?: string;
  event_date?: string;
  as_of_date: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClimateRiskProfile {
  property_id: string;
  records: ClimateRiskRecord[];
  updated_at: string;
}

export class ClimateRiskClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.CLIMATE_RISK_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(method: string, path: string, body?: unknown, retries = 3): Promise<T> {
    let lastError: Error = new Error('Climate risk service error');
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const authHeaders = await this.authHeaders();
        const res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = (await res.json()) as { success: boolean; data: T; message?: string; error?: string };
        if (!json.success) throw new Error(json.message || json.error || 'Climate risk service error');
        return json.data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  addRecord(propertyId: string, data: {
    hazardType: HazardType; dataType: ClimateDataType; riskLevel: ClimateRiskLevel;
    description: string; source: string; confidencePct?: number; marginOfErrorNote?: string;
    eventDate?: string; recordedBy: string;
  }) {
    return this.request<ClimateRiskProfile>('POST', `/${propertyId}`, data);
  }

  getProfile(propertyId: string) {
    return this.request<ClimateRiskProfile>('GET', `/${propertyId}`);
  }

  removeRecord(propertyId: string, recordId: string) {
    return this.request<ClimateRiskProfile>('DELETE', `/${propertyId}/${recordId}`);
  }
}

let _sharedClient: ClimateRiskClient | null = null;
export const getClimateRiskClient = (): ClimateRiskClient => {
  if (!_sharedClient) _sharedClient = new ClimateRiskClient();
  return _sharedClient;
};
