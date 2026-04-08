export interface Supplier {
  id: number;
  name: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  status?: string;
}
