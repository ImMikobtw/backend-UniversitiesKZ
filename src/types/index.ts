export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  university_id: number | null;
}

export interface University {
  id: number;
  name_kz: string;
  name_ru: string;
  abbreviation_kz: string;
  abbreviation_ru: string;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  code: string;
  status: string;
  student_count?: number;
  ent_score?: number;
  qs_score?: string;
  logo_url?: string;
  map_point?: string;
  description?: string;
  services?: string[];
}

export interface Specialty {
  id: number;
  university_id: number;
  code: string;
  name: string;
  description?: string;
  ent_score?: number;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
}