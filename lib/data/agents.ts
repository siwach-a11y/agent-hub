import { Agent } from "@/lib/types";

export const agents: Agent[] = [
  {
    id: "voucher-discovery",
    name: "Voucher Discovery Agent",
    author: "RewardHub",
    description:
      "Discover redeemable vouchers across dining, fashion, travel, and beauty. Filter by category or brand and claim before they expire.",
    icon: "🎟️",
    category: "Voucher & Rewards",
    tags: ["vouchers", "coupons", "discounts", "savings", "redeem"],
    rating: 4.7,
    reviewCount: 831,
    userCount: 19800,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
  {
    id: "daily-deals",
    name: "Daily Deals Agent",
    author: "RewardHub",
    description:
      "Fresh deals every day that reset at midnight. Grab today's picks across electronics, dining, travel, and fashion before the clock runs out.",
    icon: "📅",
    category: "Voucher & Rewards",
    tags: ["daily deals", "deal of the day", "discounts", "shopping"],
    rating: 4.6,
    reviewCount: 674,
    userCount: 16200,
    price: "Free",
    badges: ["Hot", "Free"],
    featured: false,
  },
  {
    id: "cashback",
    name: "Cashback Agent",
    author: "RewardHub",
    description:
      "Earn money back on everyday spend. Activate cashback on groceries, food delivery, electronics, and beauty — credited straight to your wallet.",
    icon: "💵",
    category: "Voucher & Rewards",
    tags: ["cashback", "money back", "rewards", "wallet", "savings"],
    rating: 4.8,
    reviewCount: 1102,
    userCount: 27400,
    price: "Free",
    badges: ["Featured", "Free"],
    featured: true,
  },
  {
    id: "promo-code",
    name: "Promo Code Agent",
    author: "RewardHub",
    description:
      "Verified promo codes ready to paste at checkout. Filter by category or brand and copy the code — discount and minimum spend shown on each offer.",
    icon: "🏷️",
    category: "Voucher & Rewards",
    tags: ["promo codes", "coupon codes", "checkout", "discounts"],
    rating: 4.5,
    reviewCount: 588,
    userCount: 14100,
    price: "Free",
    badges: ["New", "Free"],
    featured: false,
  },
  {
    id: "loyalty-rewards",
    name: "Loyalty Rewards Agent",
    author: "RewardHub",
    description:
      "Turn loyalty points and miles into real value. Browse redemptions across coffee, beauty, travel, and groceries with points needed and value shown.",
    icon: "🎁",
    category: "Voucher & Rewards",
    tags: ["loyalty", "points", "miles", "rewards", "redeem"],
    rating: 4.6,
    reviewCount: 719,
    userCount: 17600,
    price: "Free",
    badges: ["Hot", "Free"],
    featured: false,
  },
  {
    id: "buy-one-get-one",
    name: "Buy 1 Get 1 Agent",
    author: "RewardHub",
    description:
      "Buy-one-get-one offers across food, entertainment, and beauty. Perfect for sharing — filter by category or brand and claim before the offer ends.",
    icon: "🛍️",
    category: "Voucher & Rewards",
    tags: ["bogo", "buy one get one", "2-for-1", "deals", "offers"],
    rating: 4.7,
    reviewCount: 642,
    userCount: 15300,
    price: "Free",
    badges: ["Free"],
    featured: false,
  },
  {
    id: "flash-sale",
    name: "Flash Sale Agent",
    author: "RewardHub",
    description:
      "Time-boxed flash sales at their deepest discounts. Stock is limited and windows are short — act fast on electronics, travel, fashion, and beauty drops.",
    icon: "🔥",
    category: "Voucher & Rewards",
    tags: ["flash sale", "limited time", "discounts", "clearance", "drops"],
    rating: 4.8,
    reviewCount: 968,
    userCount: 24900,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
];

export const categories = ["All", "Voucher & Rewards"] as const;

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

export function getFeaturedAgents(): Agent[] {
  return agents.filter((a) => a.featured).slice(0, 4);
}

export function getMarketplaceStats() {
  const uniqueCategories = new Set(agents.map((a) => a.category));
  const totalUsers = agents.reduce((sum, a) => sum + a.userCount, 0);
  const avgRating =
    agents.reduce((sum, a) => sum + a.rating, 0) / agents.length;
  return {
    totalAgents: agents.length,
    categories: uniqueCategories.size,
    monthlyUsers: Math.round(totalUsers * 0.12),
    avgRating: Math.round(avgRating * 10) / 10,
  };
}
