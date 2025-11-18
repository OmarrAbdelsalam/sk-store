export interface Color {
  id: number;
  colorNameAr: string;
  colorNameEn: string;
  hexa: string;
}

export interface ColorFormData {
  colorNameAr: string;
  colorNameEn: string;
  hexa: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}
