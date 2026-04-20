export type Sector = 'inmobiliario' | 'servicios' | 'retail' | 'industria';
export type Size = '1-5' | '5-30' | '30+';
export type Tried = 'no' | 'tools' | 'consultant';
export type Urgency = 'now' | 'quarter' | 'exploring';
export type Budget = 'yes' | 'justify' | 'no';
export type Qualification = 'hot' | 'warm' | 'cold';

export interface LeadFormData {
  sector: Sector;
  size: Size;
  pain: string;
  tried: Tried;
  urgency: Urgency;
  budget: Budget;
  name: string;
  email: string;
  company: string;
  notes: string;
}

export interface ScoreResult {
  score: number;
  qualification: Qualification;
}

export interface LeadRecord extends LeadFormData {
  id: string;
  score: number;
  qualification: Qualification;
  created_at: string;
}

export interface ApiResponse {
  success: boolean;
  qualification?: Qualification;
  score?: number;
  calendly_url?: string;
  error?: string;
}
