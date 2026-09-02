// Delivery Express Core Constants & Config
export const BRAND = {
  name: "Delivery Express",
  tagline: "Your first choice in delivery. Anything, Anywhere!",
  facebookPage: "https://www.facebook.com/deliveryexpress23",
  messengerUsername: "deliveryexpress23",
  hotline: "+63 912 345 6789",
  operatingHours: {
    start: 8, // 8:00 AM
    end: 2,   // 2:00 AM (next day)
    display: "8:00 AM - 2:00 AM Daily"
  },
  coverage: "Metro & Surrounding Municipalities"
};

export const SERVICES = [
  {
    id: "food_delivery",
    name: "Food Delivery",
    tagline: "Fast & hot from your favorite restaurant or food cart",
    icon: "Utensils",
    badge: "Popular",
    color: "from-amber-500 to-rose-600",
    baseFare: 50,
    perKmRate: 10,
    errandFee: 15,
    fields: [
      { name: "restaurantName", label: "Restaurant / Food Stall Name", type: "text", required: true, placeholder: "e.g. Jollibee, Local Barbecue, Cafe" },
      { name: "foodOrders", label: "Food Items & Special Instructions", type: "textarea", required: true, placeholder: "List your orders (e.g. 1pc Chickenjoy Spicy with extra rice, 1 Large Coke Zero, no ice)" },
      { name: "estimatedCost", label: "Estimated Total Food Cost (₱)", type: "number", required: true, placeholder: "e.g. 350" }
    ]
  },
  {
    id: "pasabuy",
    name: "Pasabuy Service",
    tagline: "Shop from convenience stores, bakery, or local stores",
    icon: "ShoppingBag",
    badge: "Most Requested",
    color: "from-rose-500 to-red-700",
    baseFare: 60,
    perKmRate: 12,
    errandFee: 30,
    fields: [
      { name: "storeName", label: "Target Store / Convenience Shop", type: "text", required: true, placeholder: "e.g. 7-Eleven, Uncle John's, Local Bakery" },
      { name: "shoppingList", label: "Items to Purchase (Item, Brand, Quantity)", type: "textarea", required: true, placeholder: "1. Loaf Bread (Gardenia)\n2. 2x 1L Fresh Milk\n3. 1 Bag of Ice" },
      { name: "budgetLimit", label: "Max Budget Limit (₱)", type: "number", required: true, placeholder: "e.g. 500" }
    ]
  },
  {
    id: "cake_flower",
    name: "Cake & Flower Delivery",
    tagline: "Delicate and gentle care handling for special celebrations",
    icon: "Gift",
    badge: "Fragile Care",
    color: "from-pink-500 to-purple-600",
    baseFare: 75,
    perKmRate: 15,
    errandFee: 20,
    fields: [
      { name: "bakeshopName", label: "Bakery / Florist Name & Branch", type: "text", required: true, placeholder: "e.g. Red Ribbon, Goldilocks, Dangwa Florist" },
      { name: "orderNumber", label: "Store Pre-order / Invoice # (if already paid)", type: "text", required: false, placeholder: "e.g. INV-98421" },
      { name: "itemSpecs", label: "Item Description & Dimensions", type: "textarea", required: true, placeholder: "e.g. 8-inch 2-Tier Birthday Cake with candles and greeting card" },
      { name: "isSurprise", label: "Is this a surprise delivery?", type: "checkbox" }
    ]
  },
  {
    id: "medicine_delivery",
    name: "Medicine Delivery",
    tagline: "Quick pharmacy pickups & prescription refills",
    icon: "Pill",
    badge: "Priority",
    color: "from-emerald-500 to-teal-700",
    baseFare: 55,
    perKmRate: 10,
    errandFee: 20,
    fields: [
      { name: "pharmacyName", label: "Preferred Pharmacy", type: "text", required: true, placeholder: "e.g. Mercury Drug, Watsons, Generic Pharmacy" },
      { name: "medicineList", label: "Medicines & Dosages Needed", type: "textarea", required: true, placeholder: "1. Biogesic 500mg (10 tablets)\n2. Neozep Forte (5 tablets)\n3. Betadine 60ml" },
      { name: "hasPrescription", label: "Requires Prescription (Rider will ask / show rx)", type: "checkbox" },
      { name: "hasSeniorDiscount", label: "Apply Senior Citizen / PWD Booklet discount", type: "checkbox" }
    ]
  },
  {
    id: "parcel_pickup_dropoff",
    name: "Pick up & Drop off Parcels",
    tagline: "Point-to-point courier for personal items and parcels",
    icon: "Package",
    badge: "Express",
    color: "from-blue-500 to-indigo-700",
    baseFare: 50,
    perKmRate: 10,
    errandFee: 10,
    fields: [
      { name: "itemDescription", label: "Package Contents", type: "text", required: true, placeholder: "e.g. Clothes, Shoes in box, Electronics, Keys" },
      { name: "packageWeight", label: "Estimated Weight (kg)", type: "number", required: false, placeholder: "e.g. 2 kg (Max 20kg for motorcycle)" },
      { name: "isFragile", label: "Handle with Extra Care (Fragile)", type: "checkbox" }
    ]
  },
  {
    id: "bills_payment",
    name: "Bills Payment",
    tagline: "Skip the long queues. We pay your utility & gov bills",
    icon: "Receipt",
    badge: "Hassle-Free",
    color: "from-amber-600 to-yellow-600",
    baseFare: 70,
    perKmRate: 12,
    errandFee: 35,
    fields: [
      { name: "billerName", label: "Biller / Payment Center", type: "text", required: true, placeholder: "e.g. Meralco, Maynilad, PLDT, Globe, SSS, Bayad Center" },
      { name: "accountNumber", label: "Account / Reference Number", type: "text", required: true, placeholder: "e.g. 1234-5678-9012" },
      { name: "amountDue", label: "Bill Amount (₱)", type: "number", required: true, placeholder: "e.g. 2450.00" },
      { name: "dueDate", label: "Due Date", type: "date", required: false }
    ]
  },
  {
    id: "general_errands",
    name: "General Errands",
    tagline: "Personal assistant tasks, queueing, and odd errands",
    icon: "Zap",
    badge: "Flexible",
    color: "from-violet-500 to-purple-800",
    baseFare: 60,
    perKmRate: 12,
    errandFee: 25,
    fields: [
      { name: "taskTitle", label: "Task Overview", type: "text", required: true, placeholder: "e.g. Pick up dry cleaning, Return borrowed tools, Line queueing" },
      { name: "taskInstructions", label: "Detailed Instructions", type: "textarea", required: true, placeholder: "Step-by-step what the rider needs to accomplish..." }
    ]
  },
  {
    id: "market_mall_kumpra",
    name: "Market & Mall Kumpra",
    tagline: "Wet market (palengke) & department store bulk shopping",
    icon: "Store",
    badge: "Heavy / Bulk",
    color: "from-green-600 to-emerald-900",
    baseFare: 80,
    perKmRate: 15,
    errandFee: 50,
    fields: [
      { name: "marketName", label: "Target Market / Supermarket", type: "text", required: true, placeholder: "e.g. Public Palengke, SM Supermarket, Puregold" },
      { name: "kumpraList", label: "Itemized Kumpra List (Pork, Fish, Veggies, etc.)", type: "textarea", required: true, placeholder: "1. 1kg Pork Kasim (cut adobo)\n2. 1kg Bangus (cleaned)\n3. 1/2kg Garlic & Onions\n4. 1 tray Eggs" },
      { name: "maxBudget", label: "Estimated Grocery Budget (₱)", type: "number", required: true, placeholder: "e.g. 1500" }
    ]
  },
  {
    id: "documents_transport",
    name: "Documents Transport",
    tagline: "Confidential, sealed, and priority document courier",
    icon: "FileText",
    badge: "Confidential",
    color: "from-sky-500 to-cyan-700",
    baseFare: 55,
    perKmRate: 10,
    errandFee: 15,
    fields: [
      { name: "documentType", label: "Document Type", type: "text", required: true, placeholder: "e.g. Notarized Contract, School TOR, Bank Cheque, Permits" },
      { name: "recipientName", label: "Authorized Receiver Name", type: "text", required: true, placeholder: "Full Name of receiver" },
      { name: "requiresSignature", label: "Requires Receiver Signature / Proof Photo", type: "checkbox" }
    ]
  }
];

export const MOCK_RIDERS = [
  {
    id: "rider-1",
    name: "Kuya Mark Santos",
    phone: "0917-882-1923",
    plate: "ABC-1234 (Honda Click 150i)",
    rating: 4.9,
    trips: 428,
    isOnline: true,
    isBusy: false,
    lat: 14.5995,
    lng: 120.9842,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "rider-2",
    name: "Kuya Jayson Reyes",
    phone: "0928-441-9012",
    plate: "XYZ-9876 (Yamaha NMAX)",
    rating: 5.0,
    trips: 615,
    isOnline: true,
    isBusy: true,
    lat: 14.6050,
    lng: 120.9920,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "rider-3",
    name: "Kuya Carlo Dalisay",
    phone: "0939-112-7845",
    plate: "NCR-5561 (Honda Beat)",
    rating: 4.85,
    trips: 340,
    isOnline: true,
    isBusy: false,
    lat: 14.5880,
    lng: 120.9780,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "DE-2026-001",
    trackingNumber: "DE-2026-001",
    serviceId: "food_delivery",
    serviceName: "Food Delivery",
    customerName: "Maria Clara",
    customerPhone: "0918-123-4567",
    pickupAddress: "Jollibee Town Center",
    pickupLandmark: "Beside Mercury Drug",
    dropoffAddress: "Block 12 Lot 4, Villa Verde Subd.",
    dropoffLandmark: "Blue Gate with flower pots",
    distanceKm: 4.2,
    estimatedFare: 107,
    itemCost: 480,
    paymentMethod: "GCash",
    status: "in_transit",
    statusText: "Out for Delivery",
    riderId: "rider-1",
    riderName: "Kuya Mark Santos",
    riderPhone: "0917-882-1923",
    details: {
      restaurantName: "Jollibee Town Center",
      foodOrders: "2x 1pc Chickenjoy Meal, 1x Yum Burger, 2x Peach Mango Pie",
      estimatedCost: 480
    },
    customerNotes: "Please ring doorbell twice",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    logs: [
      { step: "Booking Confirmed", time: "25m ago", done: true },
      { step: "Rider Assigned (Kuya Mark)", time: "22m ago", done: true },
      { step: "Purchased at Store", time: "10m ago", done: true },
      { step: "Out for Delivery", time: "4m ago", done: true },
      { step: "Delivered & Completed", time: "Pending", done: false }
    ]
  },
  {
    id: "DE-2026-002",
    trackingNumber: "DE-2026-002",
    serviceId: "pasabuy",
    serviceName: "Pasabuy Service",
    customerName: "Anthony Ramos",
    customerPhone: "0917-555-8899",
    pickupAddress: "7-Eleven Plaza Branch",
    pickupLandmark: "Corner Rizal Ave",
    dropoffAddress: "San Jose Heights, Unit 3B",
    dropoffLandmark: "Near Barangay Hall",
    distanceKm: 2.8,
    estimatedFare: 124,
    itemCost: 320,
    paymentMethod: "Cash on Delivery",
    status: "assigned",
    statusText: "Rider Heading to Store",
    riderId: "rider-2",
    riderName: "Kuya Jayson Reyes",
    riderPhone: "0928-441-9012",
    details: {
      storeName: "7-Eleven Plaza Branch",
      shoppingList: "1. 2x Big Bite Hotdog\n2. 1x Gatorade Blue 500ml\n3. 1 Bag Ice",
      budgetLimit: 350
    },
    customerNotes: "Please text when you arrive at 7-Eleven",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    logs: [
      { step: "Booking Confirmed", time: "10m ago", done: true },
      { step: "Rider Assigned (Kuya Jayson)", time: "8m ago", done: true },
      { step: "Purchased at Store", time: "Pending", done: false },
      { step: "Out for Delivery", time: "Pending", done: false },
      { step: "Delivered & Completed", time: "Pending", done: false }
    ]
  }
];

export const ORDER_STATUSES = {
  pending: { label: "Pending Dispatch", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  assigned: { label: "Rider Assigned", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  purchasing: { label: "At Pickup / Purchasing", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  in_transit: { label: "Out for Delivery", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  delivered: { label: "Delivered & Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
};
