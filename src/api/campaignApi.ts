import axiosClient from './axiosClient';

export interface Campaign {
  _id: string;
  campaignId: string;
  campaignName: string;
  emailStatus?: string;
  emailSentCount?: number;
  emailTotalCount?: number;
  [key: string]: any;
}

export interface GetCampaignsResponse {
  success: boolean;
  data: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmailStatusResponse {
  success: boolean;
  data: {
    campaignId: string;
    campaignName: string;
    emailStatus: string;
    emailSentCount: number;
    emailTotalCount: number;
    emailCronScheduled: boolean;
    sendingDateTime?: string;
  };
}

export interface TriggerEmailResponse {
  success: boolean;
  message: string;
  data: any;
}

// 1. Trigger Email Sending for a Campaign
export const triggerEmailSending = async (campaignId: string): Promise<TriggerEmailResponse> => {
  const response = await axiosClient.post(`/campaigns/sending-email/${campaignId}`);
  return response.data;
};

// 2. Check Email Sending Status
export const checkEmailStatus = async (campaignId: string): Promise<EmailStatusResponse> => {
  const response = await axiosClient.get(`/campaigns/email-status/${campaignId}`);
  return response.data;
};

// 3. Campaigns listing API
export const getCampaigns = async (page: number = 1, limit: number = 10): Promise<GetCampaignsResponse> => {
  const response = await axiosClient.get(`/campaigns`, {
    params: { page, limit }
  });
  return response.data;
};
