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
    baseFare: 70,
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

export const MOCK_RIDERS = [];
export const INITIAL_ORDERS = [];

export const ORDER_STATUSES = {
  pending: { label: "Pending Dispatch", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  assigned: { label: "Rider Assigned", color: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20" },
  heading_to_pickup: { label: "Heading to Pickup", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" },
  at_pickup_purchasing: { label: "Purchasing / At Store", color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" },
  purchasing: { label: "Purchasing / At Store", color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" },
  in_transit: { label: "Out for Delivery", color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" },
  delivered: { label: "Delivered & Completed", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" }
};

export const DEFAULT_PARTNER_STORES = [
  {
    id: "balamban_liempo_orig",
    name: "Balamban Liempo & Lechon House",
    category: "Balamban Specialties",
    zone: "Balamban Proper / Highway Hub",
    tagline: "The Home of the World-Famous Herb & Garlic Pork Liempo",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.9,
    serviceType: "food_delivery",
    openingHours: "9:00 AM - 9:00 PM",
    items: [
      {
        id: "liempo_whole",
        name: "Original Balamban Liempo (Whole Roll)",
        price: 320,
        description: "Signature crispy skin rolled pork belly stuffed with secret herbs, garlic & lemongrass.",
        category: "Bestseller",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "lechon_manok",
        name: "Herbal Lechon Manok (Whole Roast Chicken)",
        price: 310,
        description: "Juicy, golden roasted whole chicken infused with native herbs.",
        category: "Roasted Specialties",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "spicy_liempo",
        name: "Spicy Balamban Liempo (Whole Roll)",
        price: 330,
        description: "Extra spicy chili garlic stuffed liempo roll.",
        category: "Spicy Specials",
        image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&auto=format&fit=crop&q=80",
        isPopular: false
      }
    ]
  },
  {
    id: "jollibee_gaisano_balamban",
    name: "Jollibee Gaisano Grand Balamban",
    category: "Fast Food & Burgers",
    zone: "Gaisano Grand Mall Balamban",
    tagline: "Langhap-Sarap Favorites for the Whole Family",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.8,
    serviceType: "food_delivery",
    openingHours: "8:00 AM - 9:00 PM",
    items: [
      {
        id: "chickenjoy_2pc",
        name: "2-pc Chickenjoy with Rice & Drink",
        price: 215,
        description: "Crispylicious, juicylicious fried chicken with savory gravy.",
        category: "Chickenjoy Meals",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "jolly_spaghetti_pan",
        name: "Jolly Spaghetti Family Pan",
        price: 260,
        description: "Sweet-style pasta with savory ham, hotdog slices, and melted cheese.",
        category: "Family Meals",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "yumburger_cheese",
        name: "Cheesy Yumburger with Fries",
        price: 125,
        description: "100% pure beef patty with signature dressing and melted cheese slice.",
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
        isPopular: false
      }
    ]
  },
  {
    id: "kusina_ni_nanay_grill",
    name: "Kusina ni Nanay & Native Grill",
    category: "Filipino & Lutong Bahay",
    zone: "Balamban Town Plaza / Poblacion",
    tagline: "Authentic Cebuano Dishes & Charcoal-Grilled Favorites",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.9,
    serviceType: "food_delivery",
    openingHours: "10:00 AM - 10:00 PM",
    items: [
      {
        id: "pork_bbq_5pcs",
        name: "Pork BBQ Skewers (5 Sticks)",
        price: 175,
        description: "Tender, marinated pork grilled to perfection with sweet basting sauce.",
        category: "Grill Specialties",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "sinigang_baboy",
        name: "Sinigang na Baboy (Pork Belly Sour Broth)",
        price: 240,
        description: "Hot tamarind sour soup with kangkong, radish, and tender pork belly cuts.",
        category: "Hot Soups",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "pancit_canton_special",
        name: "Pancit Canton Guisado Special",
        price: 190,
        description: "Stir-fried egg noodles with shredded pork, chicken liver, and crisp veggies.",
        category: "Noodles",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80",
        isPopular: false
      }
    ]
  },
  {
    id: "red_ribbon_goldilocks_bakeshop",
    name: "Red Ribbon & Bakeshop Hub",
    category: "Cakes, Pastries & Bakery",
    zone: "Gaisano Grand Mall Balamban",
    tagline: "Celebration Cakes & Freshly Baked Sweets",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.9,
    serviceType: "cake_flower",
    openingHours: "9:00 AM - 8:30 PM",
    items: [
      {
        id: "black_forest_cake",
        name: "Classic Black Forest Cake (8-inch)",
        price: 680,
        description: "Rich chocolate sponge layered with cherry filling, whipped cream and chocolate shavings.",
        category: "Round Cakes",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "mango_dedication_cake",
        name: "Mango Supreme Dedication Cake (8x12)",
        price: 750,
        description: "Moist sponge cake topped with fresh ripe mango slices and cream.",
        category: "Celebration Cakes",
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      }
    ]
  },
  {
    id: "balamban_milktea_cafe",
    name: "Balamban Milk Tea & Coffee Bar",
    category: "Beverages & Milk Tea",
    zone: "Balamban Town Proper",
    tagline: "Freshly Brewed Boba Milk Tea & Ice Blended Coffee",
    image: "https://images.unsplash.com/photo-1558857563-b37cfb4a0342?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.8,
    serviceType: "food_delivery",
    openingHours: "10:00 AM - 10:00 PM",
    items: [
      {
        id: "wintermelon_milktea",
        name: "Wintermelon Milk Tea with Pearls (Large)",
        price: 120,
        description: "Classic sweet wintermelon tea base with brown sugar tapioca pearls.",
        category: "Milk Tea",
        image: "https://images.unsplash.com/photo-1558857563-b37cfb4a0342?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "iced_caramel_macchiato",
        name: "Iced Caramel Macchiato (16oz)",
        price: 135,
        description: "Espresso shot poured over fresh cold milk and drizzled with buttery caramel.",
        category: "Iced Coffee",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      }
    ]
  },
  {
    id: "seven_eleven_360_balamban",
    name: "7-Eleven & 360 Convenience Hub",
    category: "Convenience & Groceries",
    zone: "Balamban Poblacion Highway",
    tagline: "24/7 Snacks, Groceries, Beverages & Essentials",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=80",
    menuFlyerUrl: "",
    rating: 4.7,
    serviceType: "pasabuy",
    openingHours: "24 Hours Daily",
    items: [
      {
        id: "siopao_asado_jumbo",
        name: "Jumbo Asado Siopao (2 pcs)",
        price: 110,
        description: "Hot steamed buns packed with savory sweet pork asado filling.",
        category: "Hot Snacks",
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80",
        isPopular: true
      },
      {
        id: "big_gulp_coke",
        name: "Big Gulp 32oz Cold Beverage",
        price: 55,
        description: "Ice-cold refreshing soda in jumbo cup.",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80",
        isPopular: false
      }
    ]
  }
];