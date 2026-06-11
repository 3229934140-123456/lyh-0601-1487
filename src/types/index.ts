export type DemandStatus = "pending" | "negotiating" | "signing" | "delivered" | "closed";

export type UserRole = "demand" | "provider" | "operator";

export type MessageType = "text" | "intention" | "question" | "material" | "minutes";

export interface Demand {
  id: string;
  title: string;
  dataScope: string;
  purpose: string;
  updateFrequency: string;
  budget: number;
  industry: string;
  region: string;
  status: DemandStatus;
  publisher: string;
  publisherCompany: string;
  createdAt: string;
  favorite: boolean;
  deadline?: string;
}

export interface SampleField {
  name: string;
  type: string;
  description: string;
  example?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sampleFields: SampleField[];
  deliveryForm: string;
  restrictions: string;
  industry: string;
  region: string;
  price: number;
  priceUnit: string;
  provider: string;
  providerCompany: string;
  createdAt: string;
  favorite: boolean;
  rating: number;
  dealsCount: number;
  coverage: string;
  updateFrequency: string;
}

export interface Intention {
  id: string;
  demandId: string;
  productId: string;
  fromRole: UserRole;
  fromName: string;
  status: "pending" | "accepted" | "rejected";
  note?: string;
  createdAt: string;
}

export interface MessageAttachment {
  name: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  communicationId: string;
  sender: string;
  senderRole: UserRole;
  type: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  timestamp: string;
}

export interface Communication {
  id: string;
  demandId: string;
  productId: string;
  demandTitle: string;
  productName: string;
  partyA: string;
  partyB: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: DemandStatus;
}

export interface DimensionScore {
  name: string;
  label: string;
  score: number;
  weight: number;
}

export interface MatchResult {
  id: string;
  demandId: string;
  productId: string;
  demand: Demand;
  product: Product;
  matchScore: number;
  dimensionScores: DimensionScore[];
  timelinessNote?: string;
  reportGenerated?: boolean;
}

export interface MatchReport {
  id: string;
  demandId: string;
  productId: string;
  matchScore: number;
  dimensionScores: DimensionScore[];
  summary: string;
  recommendations: string[];
  timelinessNote?: string;
  generatedBy: string;
  createdAt: string;
}

export interface TrendDataPoint {
  month: string;
  pending: number;
  negotiating: number;
  signing: number;
  delivered: number;
  total: number;
  amount: number;
}
