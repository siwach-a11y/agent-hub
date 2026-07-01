import { RewardType } from "@/lib/types";

// Config-driven discovery profiles — a TS port of Fando's discovery profiles.
// Each reward type has a profile controlling what the discovery agent searches
// for and how many results to target, so operators tune coverage via config.

export interface DiscoveryProfile {
  rewardType: RewardType;
  label: string;
  /** Guidance woven into the discovery prompt for this reward type. */
  hint: string;
  /** How many offers to target per run. */
  itemsTarget: number;
}

export const DISCOVERY_PROFILES: Record<RewardType, DiscoveryProfile> = {
  voucher: {
    rewardType: "voucher",
    label: "Vouchers",
    hint: "redeemable store vouchers and gift-voucher deals",
    itemsTarget: 8,
  },
  "daily-deal": {
    rewardType: "daily-deal",
    label: "Daily Deals",
    hint: "deal-of-the-day and today-only price drops",
    itemsTarget: 8,
  },
  cashback: {
    rewardType: "cashback",
    label: "Cashback",
    hint: "cashback offers and money-back rewards with their rates",
    itemsTarget: 8,
  },
  "promo-code": {
    rewardType: "promo-code",
    label: "Promo Codes",
    hint: "working promo/coupon codes with the code and minimum spend",
    itemsTarget: 8,
  },
  loyalty: {
    rewardType: "loyalty",
    label: "Loyalty Rewards",
    hint: "loyalty-program redemptions and points/miles reward offers",
    itemsTarget: 6,
  },
  bogo: {
    rewardType: "bogo",
    label: "Buy 1 Get 1",
    hint: "buy-one-get-one and 2-for-1 offers",
    itemsTarget: 6,
  },
  "flash-sale": {
    rewardType: "flash-sale",
    label: "Flash Sales",
    hint: "time-limited flash sales at their deepest discounts",
    itemsTarget: 8,
  },
};

export function getProfile(rewardType: RewardType): DiscoveryProfile {
  return DISCOVERY_PROFILES[rewardType];
}
