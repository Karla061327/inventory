export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  status?: string;
}
