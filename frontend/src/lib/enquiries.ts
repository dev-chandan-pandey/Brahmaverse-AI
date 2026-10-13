
import { api } from "./api";

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  courseInterest: string;
  message?: string;
  claimedBy?: string | null;
  claimedAt?: string | null;
  createdAt: string;
}

export interface EnquiryListResponse {
  success: boolean;
  data: {
    enquiries: Enquiry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface EnquiryResponse {
  success: boolean;
  message?: string;
  data: {
    enquiry: Enquiry;
  };
}

export async function getPublicLeads(page = 1) {
  const { data } = await api.get<EnquiryListResponse>(
    "/enquiries/public",
    { params: { page, limit: 20 } },
  );

  return data.data;
}

export async function getMyLeads(page = 1) {
  const { data } = await api.get<EnquiryListResponse>(
    "/enquiries/mine",
    { params: { page, limit: 20 } },
  );

  return data.data;
}

export async function claimLead(id: string) {
  const { data } = await api.patch<EnquiryResponse>(
    `/enquiries/${id}/claim`,
  );

  return data.data.enquiry;
}

export async function createEnquiry(input: {
  name: string;
  email: string;
  phone?: string;
  courseInterest: string;
  message?: string;
}) {
  const { data } = await api.post<EnquiryResponse>(
    "/enquiries",
    input,
  );

  return data.data.enquiry;
}
