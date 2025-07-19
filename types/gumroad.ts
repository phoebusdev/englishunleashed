export interface GumroadProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  formatted_price: string;
  short_url: string;
  description: string;
  thumbnail_url: string | null;
  published: boolean;
  sales_count: number;
  file_info?: {
    Size: string;
    Length: string;
  };
}

export interface GumroadApiResponse {
  success: boolean;
  products: GumroadProduct[];
}

export interface ProcessedGumroadProduct {
  id: string;
  title: string;
  cleanTitle: string; // Title without the "|" part
  price: number;
  formattedPrice: string;
  checkoutUrl: string;
  description: string;
  thumbnailUrl: string | null;
  salesCount: number;
  fileInfo?: {
    size: string;
    pages: string;
  };
}