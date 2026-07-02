import { RewardCategory, RewardType } from "@/lib/types";

export type PipelineStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "published";

/** A voucher/deal surfaced by discovery, moving through the pipeline. */
export interface DiscoveredOffer {
  /** Canonical dedupe key, e.g. "grabfood.com/promos" → stable id. */
  id: string;
  rewardType: RewardType;
  title: string;
  merchant: string;
  category: RewardCategory;
  /** ISO 3166-1 alpha-2 country the offer applies to. */
  country: string;
  description: string;
  /** Human value, e.g. "20% off", "Buy 1 Get 1 Free", "8% cashback". */
  discountText?: string;
  promoCode?: string;
  /** Where the shopper redeems. */
  url: string;
  /** Source page the offer was discovered from. */
  sourceUrl: string;
  /** Quality score from the source gate (higher = more trustworthy). */
  score: number;
  status: PipelineStatus;
  discoveredAt: string;
  approvedAt?: string;
  publishedAt?: string;
  notes?: string;
}

export interface QueueFilter {
  status?: PipelineStatus;
  country?: string;
  category?: RewardCategory;
  rewardType?: RewardType;
}

export interface UpsertResult {
  added: number;
  skipped: number;
  offers: DiscoveredOffer[];
}
