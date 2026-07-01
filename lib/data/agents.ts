import { Agent } from "@/lib/types";

export const agents: Agent[] = [
  {
    id: "trending-video-finder",
    name: "Trending Video Finder",
    author: "ClipPulse AI",
    description:
      "Fando-inspired pipeline: discover short-form clips (YouTube, TikTok, Instagram), queue for review, approve, generate captions, and publish. Official sources + URL dedupe.",
    icon: "📺",
    category: "Entertainment",
    tags: ["videos", "trending", "viral", "youtube", "tiktok", "social"],
    rating: 4.6,
    reviewCount: 892,
    userCount: 22100,
    price: "Free",
    badges: ["New", "Hot", "Free"],
    featured: true,
  },
  {
    id: "concert-ticket-finder",
    name: "Concert Ticket Finder",
    author: "SoundWave Labs",
    description:
      "Discover live concerts by artist, genre, city, and month. Snipe tickets with Ticket Sniper Bot automation and get AI-powered recommendations.",
    icon: "🎵",
    category: "Entertainment",
    tags: ["concerts", "music", "tickets", "sniper", "automation"],
    rating: 4.8,
    reviewCount: 1243,
    userCount: 28500,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
  {
    id: "flight-hotel-finder",
    name: "Flight & Hotel Finder",
    author: "SkyRoute AI",
    description:
      "Search flights, hotels, or bundled travel deals. Use Snipe Mode to hunt by route and budget, or snipe individual listings with Ticket Sniper Bot automation.",
    icon: "✈️",
    category: "Travel",
    tags: ["flights", "hotels", "travel", "bundles", "sniper"],
    rating: 4.7,
    reviewCount: 2105,
    userCount: 45200,
    price: "Free",
    badges: ["Featured", "Free"],
    featured: true,
  },
  {
    id: "currency-exchange",
    name: "Currency Exchange",
    author: "ForexPulse",
    description:
      "Convert between 20 world currencies. Scan top 10 banks and local exchange agents by country, then snipe the best traveler rate with Ticket Sniper Bot.",
    icon: "💱",
    category: "Finance",
    tags: ["currency", "forex", "exchange", "rates", "sniper"],
    rating: 4.5,
    reviewCount: 567,
    userCount: 12400,
    price: "Free",
    badges: ["Free"],
    featured: false,
  },
  {
    id: "car-rental-finder",
    name: "Car Rental Finder",
    author: "DriveEasy",
    description:
      "Find rental cars by type, transmission, and budget. Snipe daily rates with Ticket Sniper Bot and get AI rental advice.",
    icon: "🚗",
    category: "Travel",
    tags: ["cars", "rental", "transport", "road trip", "sniper"],
    rating: 4.4,
    reviewCount: 412,
    userCount: 8900,
    price: "Free",
    badges: ["New", "Free"],
    featured: false,
  },
  {
    id: "event-deal-flash-sale",
    name: "Event Deal & Flash Sale",
    author: "DealRadar",
    description:
      "Browse live flash sales and event deals across electronics, travel, tickets, fashion, and home. Filter by discount, category, and ending soon.",
    icon: "⚡",
    category: "Entertainment",
    tags: ["deals", "flash sale", "discounts", "shopping", "events"],
    rating: 4.5,
    reviewCount: 743,
    userCount: 18900,
    price: "Free",
    badges: ["Hot", "Free"],
    featured: false,
  },
  {
    id: "event-deal-hunter",
    name: "Event Deal Hunter",
    author: "DealRadar",
    description:
      "Snipe flash sale drops, restocks, and price cuts. Set target prices and auto-checkout via Ticket Sniper Bot when deals go live.",
    icon: "🎯",
    category: "Entertainment",
    tags: ["deals", "snipe", "flash sale", "tickets", "automation"],
    rating: 4.8,
    reviewCount: 956,
    userCount: 26700,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
  {
    id: "personal-loan-finder",
    name: "Personal Loan Finder",
    author: "RateLend",
    description:
      "Compare personal loan interest rates from banks, fintech lenders, and credit unions. Calculate monthly payments and snipe your target APR with Loan Rate Sniper Bot.",
    icon: "💰",
    category: "Finance",
    tags: ["loans", "apr", "interest rates", "compare", "sniper"],
    rating: 4.8,
    reviewCount: 1245,
    userCount: 31200,
    price: "Free",
    badges: ["Featured", "Hot", "Free"],
    featured: true,
  },
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

export const categories = [
  "All",
  "Travel",
  "Entertainment",
  "Finance",
  "Voucher & Rewards",
] as const;

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
