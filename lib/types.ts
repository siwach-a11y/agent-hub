export type Category = "Voucher & Rewards";
export type Badge = "Featured" | "New" | "Hot" | "Free";
export type Availability = "available" | "few-left" | "sold-out";

export interface Agent {
  id: string;
  name: string;
  author: string;
  description: string;
  icon: string;
  category: Category;
  tags: string[];
  rating: number;
  reviewCount: number;
  userCount: number;
  price: string;
  badges: Badge[];
  featured: boolean;
}

// --- Voucher & Rewards ---

export type RewardType =
  | "voucher"
  | "daily-deal"
  | "cashback"
  | "promo-code"
  | "loyalty"
  | "bogo"
  | "flash-sale";

export type RewardCategory =
  | "Food & Dining"
  | "Fashion"
  | "Electronics"
  | "Travel"
  | "Groceries"
  | "Beauty"
  | "Entertainment";

export interface RewardOffer {
  id: string;
  type: RewardType;
  title: string;
  brand: string;
  category: RewardCategory;
  description: string;
  /** Percent off — vouchers, daily deals, promo codes, flash sales */
  discountPercent?: number;
  originalPrice?: number;
  salePrice?: number;
  /** Cashback rate for cashback offers */
  cashbackPercent?: number;
  /** Code the shopper enters at checkout — promo-code offers */
  promoCode?: string;
  /** Points needed to redeem — loyalty offers */
  pointsRequired?: number;
  /** Human-readable value of the redemption, e.g. "Worth $10" */
  pointsValue?: string;
  /** BOGO framing, e.g. "Buy 1 Get 1 Free" */
  bogoDetail?: string;
  /** Minimum spend to unlock the offer */
  minSpend?: number;
  endsAt: string;
  featured?: boolean;
  city?: string;
  availability: Availability;
  url: string;
}
