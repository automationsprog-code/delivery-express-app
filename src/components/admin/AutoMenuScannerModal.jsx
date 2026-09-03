import React, { useState, useRef } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  X, 
  Image as ImageIcon, 
  Edit3, 
  ArrowRight,
  Layers,
  Flame,
  Check,
  RefreshCw
} from 'lucide-react';

export default function AutoMenuScannerModal({ store, onClose }) {
  const { addBulkMenuItems } = useOrder();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedDishes, setExtractedDishes] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);
  const dishPhotoInputRef = useRef(null);
  const [editingDishIndexForPhoto, setEditingDishIndexForPhoto] = useState(null);

  const FOOD_IMAGE_BANK = {
    chicken: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80',
    wings: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
    spaghetti: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    fries: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
    rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80',
    beverage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    liempo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80'
  };

  const SAMPLE_MENUS = [
    {
      title: '🍗 Jollibee Chickenjoy & Combo Meals',
      desc: 'Extracted from Chickenjoy Billboard (C1 to C8)',
      items: [
        { name: 'C1: 1-pc Chickenjoy with Rice & Drink', price: 90, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'C1 Spicy: 1-pc Spicy Chickenjoy Meal', price: 92, category: 'Chickenjoy Meals', isPopular: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
        { name: 'C2: 1-pc Chickenjoy with Double Rice', price: 99, category: 'Chickenjoy Meals', isPopular: false, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'C3: 1-pc Chickenjoy with Jolly Spaghetti', price: 122, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80' },
        { name: 'C4: 1-pc Chickenjoy with Palabok', price: 167, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'C5: 2-pc Chickenjoy Solo/Value Meal', price: 170, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'C6: 1-pc Chickenjoy with Fries & Drink', price: 105, category: 'Chickenjoy Meals', isPopular: false, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80' },
        { name: '6-pc Chickenjoy Bucket', price: 399, category: 'Family Buckets', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo C1: Buffalo Wings Rice Meal', price: 159, category: 'Flavored Wings', isPopular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo C2: Lemon Pepper Wings Rice Meal', price: 159, category: 'Flavored Wings', isPopular: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo C3: Sweet Chili Wings Rice Meal', price: 159, category: 'Flavored Wings', isPopular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo C4: Teriyaki Wings Rice Meal', price: 159, category: 'Flavored Wings', isPopular: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo C8: 6 pcs Crispy House Blend Chicken', price: 500, category: 'Group Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'Combo CS: Crispy Chicken Spaghetti', price: 110, category: 'Combo Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      title: '🐷 Balamban Liempo & Inasal Specialties',
      desc: 'Native herbs, roast pork liempo, grilled chicken inasal',
      items: [
        { name: 'Original Balamban Liempo (Whole Roll)', price: 320, category: 'Liempo & Pork', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
        { name: 'Spicy Balamban Liempo (Whole)', price: 335, category: 'Liempo & Pork', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lechon Manok / Roast Chicken', price: 340, category: 'Roast Chicken', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
        { name: 'Grilled Pork BBQ (3 Sticks)', price: 95, category: 'Sides & BBQ', isPopular: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
        { name: 'Extra Steamed Rice / Puso', price: 15, category: 'Rice', isPopular: false, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      title: "🍕 Tet's Spizzal (Pizzas, Pastas, Burgers, Wings & Barkada)",
      desc: 'Full official menu with 12"/15"/18" Pizzas, Burgers & Wraps',
      items: [
        { name: 'Hawaiian Pizza (12")', price: 280, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Hawaiian Pizza (15")', price: 450, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Hawaiian Pizza (18" Party)', price: 780, category: 'Pizza', isPopular: false, image: '' },
        { name: 'Pepperoni Pizza (12")', price: 450, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Pepperoni Pizza (15")', price: 640, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Pepperoni Pizza (18" Party)', price: 890, category: 'Pizza', isPopular: false, image: '' },
        { name: 'Loaded Supreme Pizza (12")', price: 425, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Full House Pizza (12")', price: 480, category: 'Pizza', isPopular: true, image: '' },
        { name: 'Carbonara Pasta', price: 140, category: 'Pasta', isPopular: true, image: '' },
        { name: 'Shrimp Pesto Pasta', price: 170, category: 'Pasta', isPopular: true, image: '' },
        { name: 'Caramelized Cheeseburger', price: 120, category: 'Burger', isPopular: true, image: '' },
        { name: 'Double Cheeseburger w/ Fries & Drink', price: 260, category: 'Burger', isPopular: true, image: '' },
        { name: '1 PC Chicken w/ Rice & Drink', price: 125, category: 'Chicken Meals', isPopular: true, image: '' },
        { name: 'Hot & Spicy Chicken Wings', price: 280, category: 'Chicken Wings', isPopular: true, image: '' },
        { name: 'Barkada Package (Pizza + Wraps + Burgers + Chicken)', price: 1299, category: 'Barkada Meals', isPopular: true, image: '' }
      ]
    },
    {
      title: "🍱 Hungry Besties (Chaofan, Silog, Lomi & Dinuguan)",
      desc: 'Chaofan specials (₱99), Silogs (₱79), Lomi (₱29-₱69), Dinuguan (₱149)',
      items: [
        { name: 'Plain Chaofan', price: 69, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80' },
        { name: 'Chicken Popcorn Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
        { name: 'Sisig Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
        { name: 'Spam Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lumpia Shanghai Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Special Dinuguan', price: 149, category: 'Special Dish', isPopular: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lomi Regular', price: 29, category: 'Lomi & Noodles', isPopular: false, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lomi with Egg', price: 49, category: 'Lomi & Noodles', isPopular: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lomi Overload', price: 69, category: 'Lomi & Noodles', isPopular: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
        { name: 'Spamsilog (Spam + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' },
        { name: 'Sisigsilog (Sizzling Sisig + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
        { name: 'Chixsilog (Chicken Popcorn + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
        { name: 'Lumpiasilog (Lumpia + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80' },
        { name: 'Extra Plain Rice', price: 20, category: 'Rice', isPopular: false, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' }
      ]
    },
    {
      title: "🍲 Lugawan sa Balamban (Lugaw, Silogs, Tokwa't Baboy)",
      desc: 'Lugaw specials (₱30-₱125), Silog Rice Meals (₱65-₱110), Sisig & Tokwa',
      items: [
        { name: 'Plain Lugaw', price: 30, category: 'Lugaw Specials', isPopular: false, image: '' },
        { name: 'Lugaw w/ Egg', price: 45, category: 'Lugaw Specials', isPopular: true, image: '' },
        { name: 'Arozcaldo', price: 65, category: 'Lugaw Specials', isPopular: true, image: '' },
        { name: 'Lugaw w/ Lechon Kawali', price: 85, category: 'Lugaw Specials', isPopular: true, image: '' },
        { name: 'Lugaw Overload', price: 125, category: 'Lugaw Specials', isPopular: true, image: '' },
        { name: 'Lugaw Siomai', price: 60, category: 'Lugaw Specials', isPopular: false, image: '' },
        { name: 'Sisig-silog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Kawali-silog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Tapsilog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Chicsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Tocilog', price: 99, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Cornsilog', price: 99, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Hotsilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Shanghaisilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Hungariansilog', price: 105, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Longsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Siomaisilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
        { name: 'Spamsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
        { name: 'Lumpiang Togue', price: 15, category: 'Sides & Specials', isPopular: true, image: '' },
        { name: 'Tokwa\'t Baboy', price: 50, category: 'Sides & Specials', isPopular: true, image: '' },
        { name: 'Sisig Platter', price: 190, category: 'Sides & Specials', isPopular: true, image: '' },
        { name: 'Siomai Ala Carte (4pcs)', price: 35, category: 'Sides & Specials', isPopular: false, image: '' },
        { name: 'Extra Egg', price: 15, category: 'Sides & Specials', isPopular: false, image: '' },
        { name: 'Extra Rice', price: 20, category: 'Sides & Specials', isPopular: false, image: '' },
        { name: 'Softdrinks', price: 20, category: 'Drinks', isPopular: false, image: '' },
        { name: 'Bottled Water', price: 20, category: 'Drinks', isPopular: false, image: '' }
      ]
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setUploadedImage(compressed);
        runAiMenuExtractor(compressed);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const runAiMenuExtractor = (imageDataUrl) => {
    setIsScanning(true);

    setTimeout(() => {
      let detectedDishes = [];
      const storeNameLower = (store?.name || '').toLowerCase();
      const storeCategoryLower = (store?.category || '').toLowerCase();

      if (storeNameLower.includes("lugaw") || storeNameLower.includes("arozcaldo") || storeNameLower.includes("goto") || storeNameLower.includes("lugawan")) {
        detectedDishes = [
          { name: 'Plain Lugaw', price: 30, category: 'Lugaw Specials', isPopular: false, image: '' },
          { name: 'Lugaw w/ Egg', price: 45, category: 'Lugaw Specials', isPopular: true, image: '' },
          { name: 'Arozcaldo', price: 65, category: 'Lugaw Specials', isPopular: true, image: '' },
          { name: 'Lugaw w/ Lechon Kawali', price: 85, category: 'Lugaw Specials', isPopular: true, image: '' },
          { name: 'Lugaw Overload', price: 125, category: 'Lugaw Specials', isPopular: true, image: '' },
          { name: 'Lugaw Siomai', price: 60, category: 'Lugaw Specials', isPopular: false, image: '' },
          { name: 'Sisig-silog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Kawali-silog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Tapsilog', price: 110, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Chicsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Tocilog', price: 99, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Cornsilog', price: 99, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Hotsilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Shanghaisilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Hungariansilog', price: 105, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Longsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Siomaisilog', price: 65, category: 'Rice Meals (Silogs)', isPopular: false, image: '' },
          { name: 'Spamsilog', price: 85, category: 'Rice Meals (Silogs)', isPopular: true, image: '' },
          { name: 'Lumpiang Togue', price: 15, category: 'Sides & Specials', isPopular: true, image: '' },
          { name: 'Tokwa\'t Baboy', price: 50, category: 'Sides & Specials', isPopular: true, image: '' },
          { name: 'Sisig Platter', price: 190, category: 'Sides & Specials', isPopular: true, image: '' },
          { name: 'Siomai Ala Carte (4pcs)', price: 35, category: 'Sides & Specials', isPopular: false, image: '' },
          { name: 'Extra Egg', price: 15, category: 'Sides & Specials', isPopular: false, image: '' },
          { name: 'Extra Rice', price: 20, category: 'Sides & Specials', isPopular: false, image: '' },
          { name: 'Softdrinks', price: 20, category: 'Drinks', isPopular: false, image: '' },
          { name: 'Bottled Water', price: 20, category: 'Drinks', isPopular: false, image: '' }
        ];
      } else if (storeNameLower.includes("hungry") || storeNameLower.includes("besties") || storeNameLower.includes("chaofan") || storeNameLower.includes("silog") || storeNameLower.includes("lomi") || storeNameLower.includes("dinuguan")) {
        detectedDishes = [
          { name: 'Plain Chaofan', price: 69, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80' },
          { name: 'Chicken Popcorn Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
          { name: 'Sisig Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
          { name: 'Spam Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lumpia Shanghai Chaofan Special', price: 99, category: 'Chaofan Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80' },
          { name: 'Special Dinuguan', price: 149, category: 'Special Dish', isPopular: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lomi Regular', price: 29, category: 'Lomi & Noodles', isPopular: false, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lomi with Egg', price: 49, category: 'Lomi & Noodles', isPopular: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lomi Overload', price: 69, category: 'Lomi & Noodles', isPopular: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80' },
          { name: 'Spamsilog (Spam + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' },
          { name: 'Sisigsilog (Sizzling Sisig + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
          { name: 'Chixsilog (Chicken Popcorn + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lumpiasilog (Lumpia + Egg + Rice)', price: 79, category: 'Rice Silog Specials', isPopular: false, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80' },
          { name: 'Extra Plain Rice', price: 20, category: 'Rice', isPopular: false, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' }
        ];
      } else if (storeNameLower.includes("tet") || storeNameLower.includes("spizzal") || storeNameLower.includes("pizza") || storeCategoryLower.includes("pizza")) {
        detectedDishes = [
          { name: 'Hawaiian Pizza (12")', price: 280, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Hawaiian Pizza (15")', price: 450, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Hawaiian Pizza (18" Party)', price: 780, category: 'Pizza', isPopular: false, image: '' },
          { name: 'Pepperoni Pizza (12")', price: 450, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Pepperoni Pizza (15")', price: 640, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Pepperoni Pizza (18" Party)', price: 890, category: 'Pizza', isPopular: false, image: '' },
          { name: 'Loaded Supreme Pizza (12")', price: 425, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Loaded Supreme Pizza (15")', price: 575, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Full House Pizza (12")', price: 480, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Full House Pizza (15")', price: 650, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Creamy Spinach Pizza (12")', price: 485, category: 'Pizza', isPopular: true, image: '' },
          { name: 'Carbonara Pasta', price: 140, category: 'Pasta', isPopular: true, image: '' },
          { name: 'Shrimp Pesto Pasta', price: 170, category: 'Pasta', isPopular: true, image: '' },
          { name: 'Caramelized Cheeseburger', price: 120, category: 'Burger', isPopular: true, image: '' },
          { name: 'Double Cheeseburger w/ Fries & Drink', price: 260, category: 'Burger', isPopular: true, image: '' },
          { name: 'Lava Ragga Chicken w/ Fries & Drink', price: 280, category: 'Burger', isPopular: true, image: '' },
          { name: '1 PC Chicken w/ Rice & Drink', price: 125, category: 'Chicken Meals', isPopular: true, image: '' },
          { name: '1 PC Chicken w/ Spaghetti', price: 145, category: 'Chicken Meals', isPopular: true, image: '' },
          { name: 'Hot & Spicy Chicken Wings', price: 280, category: 'Chicken Wings', isPopular: true, image: '' },
          { name: 'BBQ Chicken Wings', price: 280, category: 'Chicken Wings', isPopular: false, image: '' },
          { name: 'Big Taco', price: 140, category: 'Wraps & Tacos', isPopular: true, image: '' },
          { name: 'Chicken Wrap w/ Fries', price: 200, category: 'Wraps & Tacos', isPopular: true, image: '' },
          { name: 'Meaty Cheesy Fries', price: 385, category: 'Nachos & Fries', isPopular: true, image: '' },
          { name: 'Barkada Package (1 Loaded Pizza + 2 Wraps + 2 Burgers + 4 Chicken w/ Fries)', price: 1299, category: 'Barkada Meals', isPopular: true, image: '' }
        ];
      } else if (storeNameLower.includes("liempo") || storeNameLower.includes("inasal") || storeNameLower.includes("bbq")) {
        detectedDishes = [
          { name: 'Original Balamban Liempo (Whole Roll)', price: 320, category: 'Liempo & Pork', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
          { name: 'Spicy Balamban Liempo (Whole)', price: 335, category: 'Liempo & Pork', isPopular: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
          { name: 'Lechon Manok / Roast Chicken', price: 340, category: 'Roast Chicken', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: 'Grilled Pork BBQ (3 Sticks)', price: 95, category: 'Sides & BBQ', isPopular: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
          { name: 'Extra Steamed Rice / Puso', price: 15, category: 'Rice', isPopular: false, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80' }
        ];
      } else {
        // Jollibee / Fastfood fallback
        detectedDishes = [
          { name: 'C1: 1-pc Chickenjoy with Rice & Drink', price: 90, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: 'C1 Spicy: 1-pc Spicy Chickenjoy Meal', price: 92, category: 'Chickenjoy Meals', isPopular: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
          { name: 'C2: 1-pc Chickenjoy with Double Rice', price: 99, category: 'Chickenjoy Meals', isPopular: false, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: 'C3: 1-pc Chickenjoy with Jolly Spaghetti', price: 122, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80' },
          { name: 'C4: 1-pc Chickenjoy with Palabok', price: 167, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: 'C5: 2-pc Chickenjoy Solo/Value Meal', price: 170, category: 'Chickenjoy Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: '6-pc Chickenjoy Bucket', price: 399, category: 'Family Buckets', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' },
          { name: 'Combo C1: Buffalo Wings Rice Meal', price: 159, category: 'Flavored Wings', isPopular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80' },
          { name: 'Combo C8: 6 pcs Crispy House Blend Chicken', price: 500, category: 'Group Meals', isPopular: true, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop&q=80' }
        ];
      }

      setExtractedDishes(detectedDishes);
      setIsScanning(false);
      setActiveTab('review');
    }, 1200);
  };

  const handleDishChange = (index, field, value) => {
    setExtractedDishes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveDish = (index) => {
    setExtractedDishes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewDishRow = () => {
    setExtractedDishes(prev => [
      ...prev,
      {
        name: 'New Food Dish',
        price: 99,
        category: 'Specialty',
        isPopular: false,
        image: FOOD_IMAGE_BANK.chicken
      }
    ]);
  };

  const handleDishPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file || editingDishIndexForPhoto === null) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        handleDishChange(editingDishIndexForPhoto, 'image', compressed);
        setEditingDishIndexForPhoto(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAllToStore = () => {
    if (extractedDishes.length === 0) return;
    addBulkMenuItems(store.id, extractedDishes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">
                  📸 AI Photo Menu Scanner & Auto-Listing
                </h3>
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Target: {store.name}
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Upload a picture of any menu flyer/billboard. It auto-detects meal codes, names, and prices for editable listing!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hidden file input for custom single-dish photo upload */}
        <input
          type="file"
          ref={dishPhotoInputRef}
          onChange={handleDishPhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Step Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('upload')}
                className={'px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ' + (
                  activeTab === 'upload'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                )}
              >
                <Camera className="w-4 h-4" />
                <span>1. Upload Menu Photo</span>
              </button>

              <button
                onClick={() => {
                  if (extractedDishes.length > 0) setActiveTab('review');
                }}
                disabled={extractedDishes.length === 0}
                className={'px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ' + (
                  activeTab === 'review'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 disabled:opacity-50'
                )}
              >
                <Edit3 className="w-4 h-4" />
                <span>2. Review & Edit Prices ({extractedDishes.length})</span>
              </button>
            </div>

            {activeTab === 'review' && (
              <button
                onClick={handleAddNewDishRow}
                className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-amber-300 dark:border-amber-700"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Dish</span>
              </button>
            )}
          </div>

          {/* TAB 1: UPLOAD OR PICK PRESET FLYER */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {/* Main Photo Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-rose-300 dark:border-rose-700/50 hover:border-rose-500 rounded-3xl p-8 sm:p-10 text-center bg-rose-50/50 dark:bg-rose-950/20 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Click to Upload Menu Photo / Flyer
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Upload camera picture, billboard photo, or digital menu flyer (JPG, PNG)
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700 text-[11px] font-bold text-rose-600 dark:text-rose-400 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI will automatically detect food names and prices (₱)</span>
                </div>
              </div>

              {/* Scanning Progress */}
              {isScanning && (
                <div className="p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-3xl text-center space-y-3 animate-pulse">
                  <RefreshCw className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
                  <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                    Scanning & Analyzing Menu Photo with AI OCR...
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Detecting meal codes (C1-C8), food dish names, combo pairings & peso prices...
                  </p>
                </div>
              )}

              {/* Quick Template Presets for Instant 1-Click Auto-Listing */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Or 1-Click Load Pre-Scanned Balamban Menus:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SAMPLE_MENUS.map((tpl, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setExtractedDishes(tpl.items);
                        setActiveTab('review');
                      }}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-rose-500 bg-white dark:bg-zinc-900 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div>
                        <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                          {tpl.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {tpl.desc} • <strong className="text-rose-600">{tpl.items.length} items</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-slate-100 group-hover:bg-rose-600 text-slate-700 group-hover:text-white rounded-xl text-xs font-black transition-all shrink-0"
                      >
                        Load Dishes ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REVIEW & EDIT EXTRACTED DISHES */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              
              {/* Quick Template Switcher Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase shrink-0">Switch Menu:</span>
                {SAMPLE_MENUS.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExtractedDishes(tpl.items)}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-[11px] font-bold shrink-0 transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm"
                  >
                    {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1]} ({tpl.items.length})
                  </button>
                ))}
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    Successfully extracted <strong className="text-emerald-900 dark:text-white">{extractedDishes.length} food items</strong>! You can edit any price, dish name, or change photo before saving.
                  </p>
                </div>
              </div>

              {/* Editable Dishes Table / Cards */}
              <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
                {extractedDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 hover:border-rose-500/40 transition-colors"
                  >
                    
                    {/* Dish Photo & Change Button */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative group shrink-0">
                        {dish.image && dish.image.trim() !== '' ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-zinc-800 shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-orange-500/20 dark:from-amber-500/10 dark:via-rose-500/10 dark:to-orange-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0 text-center p-0.5 shadow-sm">
                            <span className="text-base">
                              {dish.category?.toLowerCase().includes('pizza') ? '🍕' :
                               dish.category?.toLowerCase().includes('burger') ? '🍔' :
                               dish.category?.toLowerCase().includes('pasta') ? '🍝' :
                               dish.category?.toLowerCase().includes('wings') || dish.category?.toLowerCase().includes('chicken') ? '🍗' :
                               dish.category?.toLowerCase().includes('salad') ? '🥗' :
                               dish.category?.toLowerCase().includes('wrap') || dish.category?.toLowerCase().includes('taco') ? '🌮' :
                               dish.category?.toLowerCase().includes('fries') || dish.category?.toLowerCase().includes('nacho') ? '🍟' :
                               dish.category?.toLowerCase().includes('barkada') ? '🍱' :
                               '🍽️'}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-tighter text-rose-600 dark:text-rose-400 truncate max-w-full">
                              {dish.name ? dish.name.split(' ').slice(0, 2).map(w => w[0]).join('') : 'TS'}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingDishIndexForPhoto(idx);
                            dishPhotoInputRef.current?.click();
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white text-[10px] font-black transition-opacity text-center p-1"
                          title="Upload/Change dish photo"
                        >
                          {dish.image ? 'Change 📸' : '+ Photo 📸'}
                        </button>
                      </div>

                      {/* Name & Category Inputs */}
                      <div className="flex-1 min-w-[200px] space-y-1.5">
                        <input
                          type="text"
                          value={dish.name}
                          onChange={(e) => handleDishChange(idx, 'name', e.target.value)}
                          placeholder="Dish Name"
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={dish.category}
                            onChange={(e) => handleDishChange(idx, 'category', e.target.value)}
                            placeholder="Category"
                            className="w-36 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-[11px] text-slate-600 dark:text-zinc-400 focus:outline-none focus:border-rose-500"
                          />
                          <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-zinc-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={dish.isPopular}
                              onChange={(e) => handleDishChange(idx, 'isPopular', e.target.checked)}
                              className="rounded text-rose-600"
                            />
                            <span>Bestseller ⭐</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Price (₱) Input & Delete Action */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
                        <span className="text-xs font-black text-rose-600">₱</span>
                        <input
                          type="number"
                          value={dish.price}
                          onChange={(e) => handleDishChange(idx, 'price', e.target.value)}
                          className="w-20 bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none"
                          placeholder="Price"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDish(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left">
            Ready to add <strong className="text-slate-900 dark:text-white">{extractedDishes.length} dishes</strong> to <strong className="text-rose-600">{store.name}</strong>.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-2xl text-xs"
            >
              Cancel
            </button>

            {extractedDishes.length > 0 && (
              <button
                type="button"
                onClick={handleSaveAllToStore}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black rounded-2xl text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save All {extractedDishes.length} Dishes to Store Menu</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
