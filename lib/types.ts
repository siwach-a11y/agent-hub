export type Category =
  | "Travel"
  | "Entertainment"
  | "Food"
  | "Finance"
  | "Career"
  | "Services"
  | "Voucher & Rewards";
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

export interface Concert {
  id: string;
  artist: string;
  genre: string;
  venue: string;
  city: string;
  date: string;
  month: string;
  price: number;
  availability: Availability;
  ticketUrl: string;
  platform: "ticketmelon" | "thaiticketmajor" | "livenation" | "eventpop" | "generic";
  saleTime?: string;
}

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  class: "Economy" | "Premium Economy" | "Business" | "First";
  price: number;
  stops: number;
  availability: Availability;
  bookingUrl: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  stars: number;
  pricePerNight: number;
  amenities: string[];
  rating: number;
  availability: Availability;
  bookingUrl: string;
}

export type RestaurantBookingPlatform =
  | "OpenTable"
  | "Resy"
  | "Tock"
  | "TableCheck"
  | "TheFork"
  | "Michelin Guide";

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  priceLevel: "$" | "$$" | "$$$" | "$$$$";
  vibe: string;
  rating: number;
  trending: boolean;
  availability: Availability;
  inMichelinGuide: boolean;
  michelinStars?: 1 | 2 | 3;
  michelinDistinction?: "Bib Gourmand" | "Selected";
  bookingUrl?: string;
  bookingPlatform?: RestaurantBookingPlatform;
}

export interface CarRental {
  id: string;
  company: string;
  model: string;
  type: "Economy" | "SUV" | "Luxury" | "Van" | "Convertible";
  transmission: "Automatic" | "Manual";
  city: string;
  pricePerDay: number;
  features: string[];
  availability: Availability;
  bookingUrl: string;
}

export interface ItineraryStop {
  time: string;
  title: string;
  description: string;
  type: "food" | "sight" | "activity" | "transport" | "rest";
}

export interface ItineraryDay {
  day: number;
  title: string;
  stops: ItineraryStop[];
}

export interface Itinerary {
  destination: string;
  days: number;
  style: string;
  itinerary: ItineraryDay[];
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export type ExchangeProviderType = "bank" | "agent";

export interface ExchangeProvider {
  id: string;
  name: string;
  type: ExchangeProviderType;
  country: string;
  countryCode: string;
  city?: string;
  /** Markup over mid-market when selling `from` for `to` (e.g. 1.2 = 1.2%) */
  spreadPercent: number;
  flatFee: number;
  rating: number;
  branches?: string;
  hours?: string;
  url: string;
}

export interface ProviderQuote {
  provider: ExchangeProvider;
  midRate: number;
  effectiveRate: number;
  outputAmount: number;
  spreadPercent: number;
  rank: number;
}

export type AppointmentCategory =
  | "Medical"
  | "Government"
  | "Embassy"
  | "DMV"
  | "Salon";

export interface AppointmentSlot {
  id: string;
  provider: string;
  category: AppointmentCategory;
  city: string;
  service: string;
  nextAvailable: string;
  waitDays: number;
  fee: number;
  availability: Availability;
  bookingUrl: string;
  platform: "zocdoc" | "passport" | "dmv" | "vfs" | "generic";
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  level: "Intern" | "Junior" | "Mid" | "Senior" | "Lead";
  salary: string;
  posted: string;
  tags: string[];
  availability: Availability;
  applyUrl: string;
}

export type DealCategory =
  | "Electronics"
  | "Fashion"
  | "Travel"
  | "Tickets"
  | "Home";

export interface EventDeal {
  id: string;
  title: string;
  merchant: string;
  category: DealCategory;
  discount: number;
  originalPrice: number;
  salePrice: number;
  endsAt: string;
  flashSale: boolean;
  city?: string;
  availability: Availability;
  dealUrl: string;
  platform: "amazon" | "lazada" | "ticketmelon" | "generic";
}

export type VisaType =
  | "Tourist"
  | "Business"
  | "Student"
  | "Work"
  | "Transit";

export interface VisaRoute {
  id: string;
  nationality: string;
  destination: string;
  visaType: VisaType;
  required: boolean;
  processingDays: number;
  fee: number;
  documents: string[];
  embassy: string;
  city: string;
  availability: Availability;
  applyUrl: string;
}

export type LoanProviderType = "bank" | "fintech" | "credit_union";

export type LoanPurpose =
  | "Debt Consolidation"
  | "Home Improvement"
  | "Medical"
  | "Wedding"
  | "General";

export interface LoanProvider {
  id: string;
  name: string;
  type: LoanProviderType;
  country: string;
  countryCode: string;
  /** Base APR % — adjusted by amount/term/credit in quote engine */
  baseApr: number;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  minCreditScore: number;
  originationFeePercent: number;
  rating: number;
  features: string[];
  url: string;
}

export interface LoanQuote {
  provider: LoanProvider;
  apr: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  originationFee: number;
  rank: number;
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
