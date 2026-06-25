import { apiClient } from "@/infrastructure/api/client";

export interface BusinessProfileSettings {
  id: string;
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  businessType?: string | null;
  employeeCount?: string | null;
  address?: {
    country?: string | null;
    streetAddress?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
}

export interface BusinessServiceRow {
  id: string;
  serviceId?: string | null;
  category: string;
  name: string;
  price: number;
  currency: string;
  status: "active" | "inactive" | string;
}

export interface ServiceCatalogCategory {
  id: string;
  name: string;
  icon?: string | null;
  services: {
    id: string;
    name: string;
    categoryId: string;
    category: string;
    icon?: string | null;
  }[];
}

export function getBusinessProfileSettings() {
  return apiClient<BusinessProfileSettings>("/business/profile");
}

export function updateBusinessProfileSettings(
  payload: Partial<BusinessProfileSettings> & {
    address?: BusinessProfileSettings["address"];
  },
) {
  return apiClient<BusinessProfileSettings>("/business/profile", {
    method: "PATCH",
    body: payload,
  });
}

export function listBusinessServices() {
  return apiClient<BusinessServiceRow[]>("/business/services");
}

export function createBusinessService(payload: {
  category: string;
  name: string;
  price: number;
  status?: string;
  currency?: string;
}) {
  return apiClient<BusinessServiceRow>("/business/services", {
    method: "POST",
    body: payload,
  });
}

export function updateBusinessService(
  id: string,
  payload: Partial<{
    category: string;
    name: string;
    price: number;
    status: string;
    currency: string;
  }>,
) {
  return apiClient<BusinessServiceRow>(`/business/services/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteBusinessService(id: string) {
  return apiClient<void>(`/business/services/${id}`, { method: "DELETE" });
}

export function getServiceCatalog() {
  return apiClient<ServiceCatalogCategory[]>("/services/catalog", {
    auth: false,
  });
}
