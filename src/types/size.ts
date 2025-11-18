export interface Size {
  id: number;
  name: string;
  sizeType: "Letter" | "Numeric";
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}
