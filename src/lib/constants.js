// Delivery Express Core Constants & Config - West Cebu Municipalities
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
  coverage: "Balamban, Asturias, Toledo, Tuburan, Pinamungajan & Surrounding Cebu Municipalities",
  defaultCenter: {
    lat: 10.5015,
    lng: 123.7150,
    name: "Balamban Town Proper, Cebu"
  }
};

export const MUNICIPALITIES_AND_ZONES = [
  {
    municipality: "Balamban (Main Hub)",
    zones: [
      "Balamban Proper / Public Palengke",
      "Gaisano Grand Mall Balamban Hub",
      "Buanoy / Tsuneishi Heavy Industries Sector",
      "Cantuod / Aliwan Sector",
      "Prenza / Pondol Boundary",
      "Baliwagan / Sta. Cruz",
      "Gaas / Transcentral Highway",
      "Nangka / Abucayan",
      "Lamesa / Mataliao"
    ]
  },
  {
    municipality: "Asturias Municipality",
    zones: [
      "Asturias Poblacion / Town Proper",
      "Tubigagmanok Sector",
      "Bago / San Roque Sector",
      "Agbanga / Owak",
      "Langub / Lanao"
    ]
  },
  {
    municipality: "Toledo City",
    zones: [
      "Toledo City Proper / Port & Terminal",
      "Gaisano Grand Toledo / Metro Toledo",
      "Luray / Sangi Sector",
      "Magdugo / Ibo",
      "Don Andres Soriano (Lutopan) Hub",
      "Matab-ang / Poog",
      "Bato / Cabitoonan"
    ]
  },
  {
    municipality: "Tuburan Municipality",
    zones: [
      "Tuburan Poblacion / Market Proper",
      "Carmelo / Fortaliza Sector",
      "Colonia / Molobolo Springs Area",
      "Amatugan / Caridad"
    ]
  },
  {
    municipality: "Pinamungajan Municipality",
    zones: [
      "Pinamungajan Poblacion",
      "Pandacan / Tutay",
      "Tajao / Busay Area"
    ]
  },
  {
    municipality: "Tabuelan Municipality",
    zones: [
      "Tabuelan Poblacion / Port",
      "Maravilla Beach Sector",
      "Tabunok / Bongon"
    ]
  }
];

export const BALAMBAN_LANDMARKS = [
  { name: "Balamban Public Market (Palengke)", lat: 10.5015, lng: 123.7150 },
  { name: "Gaisano Grand Mall Balamban", lat: 10.4990, lng: 123.7175 },
  { name: "Tsuneishi / Buanoy Shipyard", lat: 10.4700, lng: 123.7050 },
  { name: "Balamban Municipal Hall / Town Plaza", lat: 10.5030, lng: 123.7140 },
  { name: "Cantuod / Aliwan, Balamban", lat: 10.5150, lng: 123.7220 },
  { name: "Prenza / Pondol, Balamban", lat: 10.4920, lng: 123.7100 },
  { name: "Asturias Poblacion (Adjacent)", lat: 10.5700, lng: 123.7150 },
  { name: "Toledo City Proper (Adjacent)", lat: 10.3770, lng: 123.6380 },
  { name: "Tuburan Town Proper (Adjacent)", lat: 10.7280, lng: 123.8250 },
  { name: "Pinamungajan Town Proper", lat: 10.2700, lng: 123.5850 }
];

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
      { name: "restaurantName", label: "Restaurant / Food Stall Name", type: "text", required: true, placeholder: "e.g. Jollibee Gaisano Balamban, Balamban Liempo, Kusina ni Nanay, Toledo / Asturias resto" },
      { name: "foodOrders", label: "Food Items & Special Instructions", type: "textarea", required: true, placeholder: "List your orders (e.g. 1 whole Balamban Liempo, 3 cups rice, 1 1.5L Coke)" },
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
      { name: "storeName", label: "Target Store / Convenience Shop", type: "text", required: true, placeholder: "e.g. 7-Eleven Balamban, Julie's Bakeshop, 360 Pharmacy, Hardware" },
      { name: "shoppingList", label: "Items to Purchase (Item, Brand, Quantity)", type: "textarea", required: true, placeholder: "1. Loaf Bread\n2. 2x 1L Fresh Milk\n3. 1 Bag of Ice" },
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
      { name: "bakeshopName", label: "Bakery / Florist Name & Branch", type: "text", required: true, placeholder: "e.g. Red Ribbon Gaisano Balamban, Goldilocks, Local Florist" },
      { name: "orderNumber", label: "Store Pre-order / Invoice # (if already paid)", type: "text", required: false, placeholder: "e.g. INV-98421" },
      { name: "itemSpecs", label: "Item Description & Dimensions", type: "textarea", required: true, placeholder: "e.g. 8-inch Birthday Cake with candles and greeting card" },
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
      { name: "pharmacyName", label: "Preferred Pharmacy", type: "text", required: true, placeholder: "e.g. Mercury Drug Balamban, Rose Pharmacy, 360 Pharmacy" },
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
      { name: "itemDescription", label: "Package Contents", type: "text", required: true, placeholder: "e.g. Clothes, Shoes in box, Electronics, Documents, Keys" },
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
      { name: "billerName", label: "Biller / Payment Center", type: "text", required: true, placeholder: "e.g. CEBECO III, Balamban / Toledo Water District, PLDT, Bayad Center" },
      { name: "accountNumber", label: "Account / Reference Number", type: "text", required: true, placeholder: "e.g. 1234-5678-9012" },
      { name: "amountDue", label: "Bill Amount (₱)", type: "number", required: true, placeholder: "e.g. 1850.00" },
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
      { name: "taskTitle", label: "Task Overview", type: "text", required: true, placeholder: "e.g. Pick up laundry, Town Hall errand, Line queueing, Government permit" },
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
      { name: "marketName", label: "Target Market / Supermarket", type: "text", required: true, placeholder: "e.g. Balamban Public Palengke, Gaisano Grand Supermarket, Toledo Market" },
      { name: "kumpraList", label: "Itemized Kumpra List (Pork, Fish, Veggies, etc.)", type: "textarea", required: true, placeholder: "1. 1kg Baboy Kasim\n2. 1kg Isda (Tulingan/Bangus)\n3. 1/2kg Ahos & Sibuyas\n4. 1 tray Itlog" },
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
      { name: "documentType", label: "Document Type", type: "text", required: true, placeholder: "e.g. Notarized Contract, Municipal Permit, School Transcript, Bank Forms" },
      { name: "recipientName", label: "Authorized Receiver Name", type: "text", required: true, placeholder: "Full Name of receiver" },
      { name: "requiresSignature", label: "Requires Receiver Signature / Proof Photo", type: "checkbox" }
    ]
  }
];

export const MOCK_RIDERS = [
  {
    id: "rider-1",
    name: "Kuya Junrey",
    phone: "0917-882-1923",
    plate: "MIO GEAR - G629MC",
    zone: "Balamban Proper / Public Palengke",
    municipality: "Balamban",
    rating: 4.9,
    trips: 428,
    isOnline: true,
    isBusy: false,
    status: "active",
    lat: 10.5015,
    lng: 123.7150,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "rider-2",
    name: "Kuya Marlon",
    phone: "0928-441-9012",
    plate: "7C-9876 (Yamaha NMAX)",
    zone: "Buanoy / Tsuneishi Heavy Industries Sector",
    municipality: "Balamban",
    rating: 5.0,
    trips: 615,
    isOnline: true,
    isBusy: true,
    status: "active",
    lat: 10.4700,
    lng: 123.7050,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "rider-3",
    name: "Kuya Jayson",
    phone: "0939-112-7845",
    plate: "7C-5561 (Honda Beat)",
    zone: "Asturias Poblacion / Town Proper",
    municipality: "Asturias",
    rating: 4.85,
    trips: 340,
    isOnline: true,
    isBusy: false,
    status: "active",
    lat: 10.5700,
    lng: 123.7150,
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
    pickupAddress: "Jollibee Gaisano Grand Mall Balamban",
    pickupLandmark: "Beside 360 Pharmacy, Gaisano Balamban",
    pickupCoords: [10.4990, 123.7175],
    dropoffAddress: "Purok 3, Barangay Buanoy, Balamban, Cebu",
    dropoffLandmark: "Near Buanoy National High School, Green Gate",
    dropoffCoords: [10.4720, 123.7060],
    distanceKm: 3.8,
    estimatedFare: 103,
    itemCost: 480,
    paymentMethod: "GCash",
    status: "in_transit",
    statusText: "Out for Delivery in Balamban",
    riderId: "rider-1",
    riderName: "Kuya Junrey",
    riderPhone: "0917-882-1923",
    riderCoords: [10.4850, 123.7110],
    details: {
      restaurantName: "Jollibee Gaisano Balamban",
      foodOrders: "2x 1pc Chickenjoy Meal, 1x Yum Burger, 2x Peach Mango Pie",
      estimatedCost: 480
    },
    messages: [
      {
        id: "msg-1",
        senderRole: "rider",
        senderName: "Kuya Junrey (Rider)",
        text: "Maayong adlaw! Naa nako sa Gaisano Balamban nag-order na.",
        time: "10 mins ago"
      },
      {
        id: "msg-2",
        senderRole: "customer",
        senderName: "Maria Clara",
        text: "Salamat kuya! Palihug ko ingon extra gravy.",
        time: "8 mins ago"
      }
    ],
    customerNotes: "Please text when approaching Buanoy bridge",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    logs: [
      { step: "Booking Confirmed", time: "25m ago", done: true },
      { step: "Rider Assigned (Kuya Junrey)", time: "22m ago", done: true },
      { step: "Purchased at Gaisano Balamban", time: "10m ago", done: true },
      { step: "Out for Delivery to Buanoy", time: "4m ago", done: true },
      { step: "Delivered & Completed", time: "Pending", done: false }
    ]
  },
  {
    id: "DE-2026-002",
    trackingNumber: "DE-2026-002",
    serviceId: "market_mall_kumpra",
    serviceName: "Market & Mall Kumpra",
    customerName: "Nanay Elena",
    customerPhone: "0917-555-8899",
    pickupAddress: "Balamban Public Market (Palengke Proper)",
    pickupLandmark: "Meat & Fish Section",
    pickupCoords: [10.5015, 123.7150],
    dropoffAddress: "Sitio Aliwan, Barangay Cantuod, Balamban",
    dropoffLandmark: "Near Cantuod Chapel",
    dropoffCoords: [10.5180, 123.7250],
    distanceKm: 2.5,
    estimatedFare: 167,
    itemCost: 950,
    paymentMethod: "Cash on Delivery",
    status: "assigned",
    statusText: "Rider Heading to Palengke",
    riderId: "rider-3",
    riderName: "Kuya Jayson",
    riderPhone: "0939-112-7845",
    riderCoords: [10.5050, 123.7170],
    details: {
      marketName: "Balamban Public Market",
      kumpraList: "1. 1kg Baboy Kasim (hiwa pang adobo)\n2. 1kg Bangus presko\n3. 1 tray itlog",
      maxBudget: 1000
    },
    customerNotes: "Palihug pili-a ang presko nga isda kuya",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    logs: [
      { step: "Booking Confirmed", time: "10m ago", done: true },
      { step: "Rider Assigned (Kuya Jayson)", time: "8m ago", done: true },
      { step: "Purchased at Market", time: "Pending", done: false },
      { step: "Out for Delivery", time: "Pending", done: false },
      { step: "Delivered & Completed", time: "Pending", done: false }
    ]
  }
];

export const ORDER_STATUSES = {
  pending: { label: "Pending Dispatch", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  assigned: { label: "Rider Assigned", color: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20" },
  purchasing: { label: "At Pickup / Purchasing", color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" },
  in_transit: { label: "Out for Delivery", color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" },
  delivered: { label: "Delivered & Completed", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" }
};