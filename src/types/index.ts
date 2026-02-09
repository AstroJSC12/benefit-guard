export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface ConversationWithMessages {
  id: string;
  title: string;
  createdAt: Date;
  messages: ChatMessage[];
}

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileType: string;
  status: "pending" | "processing" | "completed" | "error";
  createdAt: Date;
}

export interface OnboardingData {
  name: string;
  zipCode: string;
  state: string;
}

export interface Provider {
  id: string;
  name: string;
  address: string;
  phone: string;
  type: "urgent_care" | "hospital" | "clinic" | "pharmacy" | "dentist";
  distance?: string;
  rating?: number;
  totalRatings?: number;
  openNow?: boolean;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  weekdayHours?: string[];
  websiteUrl?: string;
  npi?: string;
  taxonomy?: string;
  networkStatus?: "in_network" | "out_of_network" | "unknown";
}

export interface RAGContext {
  userDocuments: RetrievedChunk[];
  knowledgeBase: RetrievedChunk[];
}

export interface RetrievedChunk {
  id: string;
  content: string;
  source: string;
  similarity: number;
  documentId?: string;
  sourceUrl?: string;
}

export type DocumentType = 
  | "sbc" 
  | "eob" 
  | "denial_letter" 
  | "medical_bill" 
  | "formulary" 
  | "other";

export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;
