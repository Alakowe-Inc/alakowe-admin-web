// Dummy data for the ALÁKÒWÉ admin dashboard.
// Replace with real API calls when backend is ready.

export const statCards = [
  { key: "users", label: "Total Users", value: 24891, delta: 12.4, icon: "Users" },
  { key: "sellers", label: "Total Sellers", value: 3142, delta: 8.1, icon: "Store" },
  { key: "listings", label: "Active Listings", value: 18203, delta: 4.6, icon: "BookOpen" },
  { key: "orders", label: "Orders Today", value: 487, delta: 22.3, icon: "ShoppingBag" },
  { key: "pending", label: "Pending Approvals", value: 64, delta: -3.2, icon: "Clock" },
  { key: "revenue", label: "Revenue", value: 128450, delta: 18.9, icon: "DollarSign", currency: true },
  { key: "flagged", label: "Flagged Accounts", value: 17, delta: -8.4, icon: "Flag" },
  { key: "traffic", label: "Active Traffic", value: 1284, delta: 6.8, icon: "Activity" },
];

export const revenueSeries = [
  { month: "Jan", revenue: 42000, orders: 280 },
  { month: "Feb", revenue: 51000, orders: 340 },
  { month: "Mar", revenue: 47800, orders: 312 },
  { month: "Apr", revenue: 63400, orders: 410 },
  { month: "May", revenue: 71200, orders: 468 },
  { month: "Jun", revenue: 84500, orders: 532 },
  { month: "Jul", revenue: 92300, orders: 590 },
  { month: "Aug", revenue: 88100, orders: 561 },
  { month: "Sep", revenue: 104200, orders: 642 },
  { month: "Oct", revenue: 118600, orders: 710 },
  { month: "Nov", revenue: 124800, orders: 768 },
  { month: "Dec", revenue: 128450, orders: 812 },
];

export const userGrowth = [
  { week: "W1", users: 1200, sellers: 180 },
  { week: "W2", users: 1480, sellers: 220 },
  { week: "W3", users: 1820, sellers: 268 },
  { week: "W4", users: 2240, sellers: 312 },
  { week: "W5", users: 2680, sellers: 368 },
  { week: "W6", users: 3140, sellers: 421 },
  { week: "W7", users: 3680, sellers: 482 },
  { week: "W8", users: 4210, sellers: 548 },
];

export const categoryBreakdown = [
  { name: "Fiction", value: 4820 },
  { name: "Non-fiction", value: 3210 },
  { name: "Children", value: 2680 },
  { name: "Academic", value: 1940 },
  { name: "Other", value: 1140 },
];

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar: string;
  role: "User" | "Seller";
  books: number;
  orders: number;
  status: "Active" | "Flagged" | "Suspended" | "Banned" | "Verified" | "Pending";
  joined: string;
  lastActive?: string;
  verified?: boolean;
  warnings?: { reason: string; date: string }[];
  suspensionHistory?: { reason: string; durationDays: number; date: string }[];
  bio?: string;
  wallet?: number;
  rating?: number;
  revenue?: number;
  pendingPayout?: number;
  bank?: { accountName: string; bankName: string; accountNumber: string };
};

const NAMES = [
  "Adaeze Okonkwo", "Chinua Balogun", "Folake Adeyemi", "Tunde Ojo", "Ngozi Eze",
  "Yusuf Bello", "Zainab Lawal", "Oluwaseun Ade", "Ifeoma Nwosu", "Kemi Bankole",
  "Tobi Johnson", "Amara Obi", "Damilola Cole", "Bisi Aluko", "Chidi Mba",
];

const ADDRESSES = [
  "12 Marina Rd, Lagos Island, Lagos",
  "8 Bode Thomas, Surulere, Lagos",
  "44 Allen Avenue, Ikeja, Lagos",
  "9 Aminu Kano Crescent, Wuse 2, Abuja",
  "21 GRA, Old GRA, Port Harcourt",
  "3 Ring Road, Bodija, Ibadan",
  "67 Awolowo Way, Ikoyi, Lagos",
  "15 Adeniran Ogunsanya, Surulere, Lagos",
];

const BANKS = ["GTBank", "Zenith Bank", "Access Bank", "UBA", "First Bank", "Kuda", "Opay"];

export const users: UserRow[] = NAMES.map((name, i) => {
  const role = i % 3 === 0 ? "Seller" : "User";
  const books = role === "Seller" ? Math.floor(Math.random() * 80) + 4 : 0;
  return {
    id: `USR-${1000 + i}`,
    name,
    email: name.toLowerCase().replace(/\s+/g, ".") + "@alakowe.app",
    phone: `+234 80${(3000000 + i * 12345).toString().slice(0, 8)}`,
    address: ADDRESSES[i % ADDRESSES.length],
    avatar: name.split(" ").map(n => n[0]).join(""),
    role,
    books,
    orders: Math.floor(Math.random() * 40),
    status: (["Active", "Active", "Active", "Verified", "Flagged", "Suspended", "Pending"] as const)[i % 7],
    joined: new Date(Date.now() - i * 86400000 * 7).toISOString().slice(0, 10),
    lastActive: new Date(Date.now() - i * 3600000 * 5).toISOString(),
    verified: i % 4 === 0,
    warnings: [],
    suspensionHistory: [],
    bio: `${role === "Seller" ? "Trusted ALÁKÒWÉ seller" : "Avid reader"} based in Lagos, Nigeria.`,
    wallet: Math.floor(Math.random() * 50000),
    rating: role === "Seller" ? +(4 + Math.random()).toFixed(1) : undefined,
    revenue: role === "Seller" ? Math.floor(Math.random() * 400000) + 20000 : undefined,
    pendingPayout: role === "Seller" ? Math.floor(Math.random() * 80000) : undefined,
    bank: role === "Seller" ? {
      accountName: name,
      bankName: BANKS[i % BANKS.length],
      accountNumber: `0${(1000000000 + i * 873421).toString().slice(0, 9)}`,
    } : undefined,
  };
});

export type Order = {
  id: string;
  buyer: string;
  seller: string;
  book: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Paid" | "Processing" | "Dispatched" | "In Transit" | "Shipped" | "Delivered" | "Cancelled";
  delivery: "Pickup" | "Drop-off" | "Courier";
  date: string;
  shippingAddress?: string;
  notes?: string;
  activity?: { ts: string; text: string }[];
};

const BOOK_TITLES = ["Things Fall Apart", "Half of a Yellow Sun", "Purple Hibiscus", "Beasts of No Nation", "The Famished Road", "Born a Crime"];

export const orders: Order[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `ORD-${20480 + i}`,
  buyer: NAMES[i % NAMES.length],
  seller: NAMES[(i + 3) % NAMES.length],
  book: BOOK_TITLES[i % BOOK_TITLES.length],
  amount: Math.floor(Math.random() * 12000) + 2500,
  status: (["Paid", "Processing", "Shipped", "Delivered", "Cancelled"] as const)[i % 5],
  delivery: (["Pickup", "Drop-off", "Courier"] as const)[i % 3],
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  shippingAddress: ADDRESSES[i % ADDRESSES.length],
  notes: i % 3 === 0 ? "Wrap as a gift if possible. Leave at reception." : "",
  activity: [
    { ts: new Date(Date.now() - i * 86400000).toISOString(), text: "Order placed" },
    { ts: new Date(Date.now() - i * 86400000 + 3600000).toISOString(), text: "Payment confirmed" },
  ],
}));

export type Listing = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  seller: string;
  price: number;
  format?: "Paperback" | "Hardback";
  quantity?: number;
  condition: "New" | "Like New" | "Good" | "Fair";
  conditionNote?: string;
  loveNote?: string;
  status: "Approved" | "Pending" | "Rejected" | "Flagged" | "Needs Correction" | "Suspended";
  date: string;
  cover: string;
  location?: string;
  pickupChoice?: "Pickup" | "Drop-off";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  correctionNote?: string;
  flagReason?: string;
  adminNotes?: string;
};

const COVERS = [
  "from-rose-300 to-orange-300",
  "from-sky-300 to-indigo-300",
  "from-emerald-300 to-teal-300",
  "from-amber-300 to-yellow-300",
  "from-violet-300 to-fuchsia-300",
  "from-slate-300 to-zinc-400",
];

const LISTING_TITLES = ["Things Fall Apart", "Half of a Yellow Sun", "Purple Hibiscus", "Beasts of No Nation", "The Famished Road", "Born a Crime", "Stay With Me", "Americanah", "My Sister, the Serial Killer", "Open City"];

export const listings: Listing[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `BK-${5500 + i}`,
  title: LISTING_TITLES[i],
  author: ["Chinua Achebe", "Chimamanda Adichie", "Chimamanda Adichie", "Uzodinma Iweala", "Ben Okri", "Trevor Noah", "Ayobami Adebayo", "Chimamanda Adichie", "Oyinkan Braithwaite", "Teju Cole"][i],
  category: ["Fiction", "Fiction", "Fiction", "Fiction", "Fiction", "Memoir", "Fiction", "Fiction", "Thriller", "Fiction"][i],
  seller: NAMES[i % NAMES.length],
  price: Math.floor(Math.random() * 9000) + 1500,
  format: i % 2 === 0 ? "Paperback" : "Hardback",
  quantity: Math.floor(Math.random() * 5) + 1,
  condition: (["New", "Like New", "Good", "Fair"] as const)[i % 4],
  conditionNote: "Spine intact, minimal shelf wear, all pages clean.",
  loveNote: "A book that shaped how I see family and silence. Hope it finds the right reader.",
  status: (["Approved", "Pending", "Rejected", "Flagged", "Approved", "Pending"] as const)[i % 6],
  date: new Date(Date.now() - i * 86400000 * 2).toISOString().slice(0, 10),
  cover: COVERS[i % COVERS.length],
  location: ADDRESSES[i % ADDRESSES.length].split(",").slice(-2).join(",").trim(),
  pickupChoice: i % 2 === 0 ? "Pickup" : "Drop-off",
}));

export const activityFeed = [
  { type: "user", text: "Adaeze Okonkwo joined as a new user", time: "2m ago" },
  { type: "listing", text: "Tunde Ojo posted a new book: Half of a Yellow Sun", time: "8m ago" },
  { type: "order", text: "Order ORD-20489 placed by Folake Adeyemi", time: "14m ago" },
  { type: "flag", text: "User Yusuf Bello was flagged for suspicious activity", time: "32m ago" },
  { type: "seller", text: "Seller Kemi Bankole was suspended", time: "1h ago" },
  { type: "approval", text: "Listing BK-5503 was approved", time: "2h ago" },
  { type: "payout", text: "Payout of ₦128,400 sent to Chidi Mba", time: "3h ago" },
];

export const topSellers = NAMES.slice(0, 5).map((name, i) => ({
  name,
  books: 120 - i * 14,
  revenue: 480000 - i * 52000,
  rating: (4.9 - i * 0.1).toFixed(1),
  trust: ["Elite", "Trusted", "Trusted", "Rising", "Rising"][i],
}));

// Pickup requests with auto-generated pickup codes
export type Pickup = {
  id: string;
  code: string;
  user: string;
  book?: string;
  address: string;
  books: number;
  status: "Requested" | "Approved" | "Picked Up" | "Cancelled" | "Scheduled" | "Completed";
  date: string;
  rider?: string;
  timeline?: { ts: string; text: string }[];
};

const genCode = (i: number) => `PUC-${(Math.random().toString(36).slice(2, 5) + i).toUpperCase()}`;

export const pickupRequests: Pickup[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `PU-${301 + i}`,
  code: genCode(i),
  user: NAMES[i],
  book: LISTING_TITLES[i % LISTING_TITLES.length],
  address: ADDRESSES[i % ADDRESSES.length],
  books: Math.floor(Math.random() * 6) + 1,
  status: (["Requested", "Approved", "Picked Up", "Scheduled", "Completed", "Cancelled"] as const)[i % 6],
  date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
  rider: i % 2 === 0 ? "Pending assignment" : "Rider John D.",
  timeline: [{ ts: new Date(Date.now() - 3600000).toISOString(), text: "Pickup requested" }],
}));

// Drop-off centres
export type DropoffCentre = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  contactPerson: string;
  active: boolean;
  hidden?: boolean;
};

export const dropoffCentres: DropoffCentre[] = [
  { id: "DC-01", name: "Yaba Hub", address: "12 Herbert Macaulay Way, Yaba, Lagos", phone: "+234 803 222 1100", hours: "Mon–Sat · 9am–6pm", contactPerson: "Ada Eze", active: true },
  { id: "DC-02", name: "Ikeja Centre", address: "44 Allen Ave, Ikeja, Lagos", phone: "+234 802 991 4421", hours: "Mon–Fri · 10am–7pm", contactPerson: "Bola Akin", active: true },
  { id: "DC-03", name: "Lekki Drop", address: "Block 4, Admiralty Way, Lekki, Lagos", phone: "+234 805 778 2210", hours: "Mon–Sun · 11am–8pm", contactPerson: "Tola Bakare", active: true },
  { id: "DC-04", name: "Abuja Central", address: "9 Aminu Kano Crescent, Wuse 2, Abuja", phone: "+234 706 442 1198", hours: "Mon–Sat · 9am–6pm", contactPerson: "Zainab Y.", active: false },
  { id: "DC-05", name: "PH Hub", address: "21 GRA, Port Harcourt", phone: "+234 813 558 7700", hours: "Tue–Sun · 10am–7pm", contactPerson: "Ifeanyi O.", active: true },
];

// Books currently dropped at centres
export type DropoffBook = {
  id: string;
  book: string;
  seller: string;
  centre: string;
  centreId: string;
  date: string;
  status: "Pending Verification" | "Verified" | "Rejected" | "In Transit" | "Delivered";
  condition: "New" | "Like New" | "Good" | "Fair";
  tracking?: string;
};

export const dropoffBooks: DropoffBook[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `DOB-${901 + i}`,
  book: LISTING_TITLES[i % LISTING_TITLES.length],
  seller: NAMES[(i + 2) % NAMES.length],
  centre: dropoffCentres[i % dropoffCentres.length].name,
  centreId: dropoffCentres[i % dropoffCentres.length].id,
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  status: (["Pending Verification", "Verified", "In Transit", "Delivered", "Rejected"] as const)[i % 5],
  condition: (["New", "Like New", "Good", "Fair"] as const)[i % 4],
  tracking: `TRK-${(Math.random().toString(36).slice(2, 8)).toUpperCase()}`,
}));

// Backwards-compat with old import name
export const dropOffs = dropoffBooks;

// Payouts
export type Payout = {
  id: string;
  seller: string;
  sellerId?: string;
  amount: number;
  status: "Pending" | "Processing" | "Paid" | "Unsuccessful";
  date: string;
  bank?: { accountName: string; bankName: string; accountNumber: string };
  linkedOrders?: string[];
  history?: { ts: string; text: string }[];
};

export const payouts: Payout[] = Array.from({ length: 6 }).map((_, i) => {
  const seller = users.find((u) => u.role === "Seller") ?? users[i];
  return {
    id: `PO-${901 + i}`,
    seller: NAMES[i],
    sellerId: `USR-${1000 + i}`,
    amount: Math.floor(Math.random() * 280000) + 40000,
    status: (["Pending", "Processing", "Paid", "Unsuccessful"] as const)[i % 4],
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    bank: {
      accountName: NAMES[i],
      bankName: BANKS[i % BANKS.length],
      accountNumber: `0${(1000000000 + i * 873421).toString().slice(0, 9)}`,
    },
    linkedOrders: [`ORD-${20480 + (i % orders.length)}`, `ORD-${20480 + ((i + 2) % orders.length)}`],
    history: [{ ts: new Date(Date.now() - 86400000).toISOString(), text: "Payout requested" }],
  };
});

// Book requests (unmatched / open)
export type BookRequest = {
  id: string;
  user: string;
  title: string;
  category: string;
  status: "Open" | "Matched" | "Closed";
  date: string;
};

export const bookRequests: BookRequest[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `REQ-${4400 + i}`,
  user: NAMES[i % NAMES.length],
  title: ["The Alchemist", "Sapiens", "Atomic Habits", "1984", "Things Fall Apart", "Long Walk to Freedom", "The Joys of Motherhood", "So Long a Letter"][i],
  category: ["Fiction", "Non-fiction", "Self-help", "Fiction", "Fiction", "Memoir", "Fiction", "Fiction"][i],
  status: (["Open", "Open", "Matched", "Closed"] as const)[i % 4],
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
}));

// Admin team management
export type AdminMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Super Admin" | "Admin" | "Moderator" | "Support";
  permissions: string[];
  lastLogin: string;
  active: boolean;
};

export const adminMembers: AdminMember[] = [
  { id: "AD-01", name: "Akin O.", email: "akin@alakowe.app", avatar: "AO", role: "Super Admin", permissions: ["all"], lastLogin: new Date(Date.now() - 60000 * 22).toISOString(), active: true },
  { id: "AD-02", name: "Ngozi Eze", email: "ngozi@alakowe.app", avatar: "NE", role: "Admin", permissions: ["users", "listings", "orders"], lastLogin: new Date(Date.now() - 86400000).toISOString(), active: true },
  { id: "AD-03", name: "Tunde Ojo", email: "tunde@alakowe.app", avatar: "TO", role: "Moderator", permissions: ["listings", "users:read"], lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(), active: true },
  { id: "AD-04", name: "Folake Adeyemi", email: "folake@alakowe.app", avatar: "FA", role: "Support", permissions: ["orders:read", "users:read"], lastLogin: new Date(Date.now() - 86400000 * 14).toISOString(), active: false },
];
