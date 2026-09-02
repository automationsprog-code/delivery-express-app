import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { SERVICES } from '../../lib/constants';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Search, 
  Store, 
  Star, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronRight, 
  X, 
  FileImage, 
  Flame, 
  Tag, 
  SlidersHorizontal,
  Layers,
  Bike
} from 'lucide-react';

export default function StoreMenuCatalog({ onOrderFromMenu }) {
  const { storesList } = useOrder();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store Menu Modal
  const [activeStore, setActiveStore] = useState(null);
  const [viewingFlyer, setViewingFlyer] = useState(null);

  // Cart / Selected Items for 1-Click Ordering
  // Structure: { [itemId]: { item, store, count } }
  const [cart, setCart] = useState({});

  const categories = [
    { id: 'all', label: 'All Stores & Menus', icon: '🍽️' },
    { id: 'Balamban Specialties', label: 'Balamban Liempo & Lechon', icon: '🐷' },
    { id: 'Fast Food & Burgers', label: 'Fast Food & Burgers', icon: '🍔' },
    { id: 'Filipino & Lutong Bahay', label: 'Grills & Lutong Bahay', icon: '🍢' },
    { id: 'Cakes, Pastries & Bakery', label: 'Cakes & Bakery', icon: '🎂' },
    { id: 'Beverages & Milk Tea', label: 'Milk Tea & Coffee', icon: '🧋' },
    { id: 'Convenience & Groceries', label: '24/7 Groceries & Snacks', icon: '🏪' }
  ];

  // Filtered stores
  const filteredStores = storesList.filter(store => {
    if (selectedCategory !== 'all' && store.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStore = store.name.toLowerCase().includes(q) || store.zone.toLowerCase().includes(q);
      const matchItems = (store.items || []).some(it => it.name.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q));
      return matchStore || matchItems;
    }
    return true;
  });

  const handleAddItem = (store, item) => {
    setCart(prev => {
      const existing = prev[item.id];
      const count = existing ? existing.count + 1 : 1;
      return {
        ...prev,
        [item.id]: { item, store, count }
      };
    });
  };

  const handleRemoveItem = (item) => {
    setCart(prev => {
      const existing = prev[item.id];
      if (!existing) return prev;
      if (existing.count <= 1) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: { ...existing, count: existing.count - 1 }
      };
    });
  };

  const cartEntries = Object.values(cart);
  const totalCartItems = cartEntries.reduce((acc, curr) => acc + curr.count, 0);
  const totalCartCost = cartEntries.reduce((acc, curr) => acc + (curr.item.price * curr.count), 0);

  // Group cart by store
  const primaryCartStore = cartEntries.length > 0 ? cartEntries[0].store : null;

  const handleProceedToBooking = () => {
    if (cartEntries.length === 0) return;

    // Generate formatted item list string
    const itemsText = cartEntries.map(e => `${e.count}x ${e.item.name} (₱${e.item.price * e.count})`).join('\n');
    const targetStore = primaryCartStore?.name || 'Partner Store';
    const landmark = primaryCartStore?.zone || 'Balamban Proper';

    const targetService = SERVICES.find(s => s.id === primaryCartStore?.serviceType) || SERVICES[0];

    onOrderFromMenu({
      service: targetService,
      storeName: targetStore,
      shoppingList: itemsText,
      foodOrders: itemsText,
      estimatedCost: totalCartCost,
      pickupAddress: `${targetStore}, ${landmark}`,
      pickupLandmark: landmark
    });

    // Close menu modal if open
    setActiveStore(null);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
            <span>Balamban & West Cebu Food Menus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            Browse Stores & Visual Menus
          </h2>
          <p className="text-xs sm:text-sm text-white/90">
            Tap dishes and grocery items from top Balamban restaurants. 1-click dispatch sends a Delivery Express courier to purchase and deliver hot to your doorstep!
          </p>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Balamban Liempo, Jollibee, Pizza, Cakes..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700/80 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-zinc-400 font-bold hidden sm:block">
            Showing {filteredStores.length} Partner Stores in Balamban
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-rose-600/20 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-rose-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => {
          return (
            <div
              key={store.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:border-rose-300 dark:hover:border-rose-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Store Banner Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{store.rating || 5.0}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {store.category}
                    </span>
                    <h3 className="text-base font-extrabold font-heading mt-1 drop-shadow-md truncate">
                      {store.name}
                    </h3>
                  </div>
                </div>

                {/* Store Details & Items Preview */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{store.zone}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{store.openingHours}</span>
                    </span>
                  </div>

                  {store.tagline && (
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1 italic">
                      "{store.tagline}"
                    </p>
                  )}

                  {/* Top 2 Menu Items Snippet */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">
                      Popular Menu Dishes:
                    </span>
                    {(store.items || []).slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-extrabold text-slate-800 dark:text-zinc-200 block truncate">
                            {item.name}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400 font-black text-[11px]">
                            ₱{item.price}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddItem(store, item)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-black rounded-lg text-[10px] transition-all flex items-center gap-1 shrink-0 border border-rose-200 dark:border-rose-500/30"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => setActiveStore(store)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500" />
                  <span>View Full Menu ({(store.items || []).length})</span>
                </button>

                {store.menuFlyerUrl && (
                  <button
                    onClick={() => setViewingFlyer(store.menuFlyerUrl)}
                    title="View Menu Flyer"
                    className="p-2.5 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-500/30 shrink-0"
                  >
                    <FileImage className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING CART SUMMARY BAR (EASY CONVENIENCE 1-CLICK ORDERING) */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40 bg-zinc-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-rose-500 space-y-3 card-float">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-600 text-white rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold truncate max-w-[180px]">
                  {primaryCartStore?.name || 'Selected Items'}
                </h4>
                <p className="text-[10px] text-zinc-400 font-bold">
                  {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in order
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase block font-bold">Total Items</span>
              <span className="text-base font-black text-amber-400 font-heading">
                ₱{totalCartCost.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCart({})}
              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-2xl transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleProceedToBooking}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <Bike className="w-4 h-4" />
              <span>Order via Delivery Express 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* STORE MENU MODAL (FULL DISH CATALOG) */}
      {activeStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="relative h-36 sm:h-44 w-full bg-slate-100 dark:bg-zinc-800 shrink-0">
              <img
                src={activeStore.image}
                alt={activeStore.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <button
                onClick={() => setActiveStore(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                  {activeStore.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-heading mt-1 truncate">
                  {activeStore.name}
                </h3>
                <p className="text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{activeStore.zone}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeStore.openingHours}</span>
                </p>
              </div>
            </div>

            {/* Modal Menu Items Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Menu Items ({(activeStore.items || []).length})
                </h4>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Select quantity to add to order
                </span>
              </div>

              {(activeStore.items || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No menu items listed yet for this store.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activeStore.items || []).map((item) => {
                    const cartItem = cart[item.id];
                    const countInCart = cartItem ? cartItem.count : 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          countInCart > 0
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500 dark:border-rose-500/50 shadow-sm'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="space-y-0.5 flex-1 min-w-0">
                            {item.isPopular && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded-md uppercase">
                                <Flame className="w-2.5 h-2.5" />
                                Bestseller
                              </span>
                            )}
                            <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h5>
                            {item.description && (
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 block pt-0.5">
                              ₱{item.price}
                            </span>
                          </div>
                        </div>

                        {/* Counter Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-800/80 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                            {countInCart > 0 ? `Subtotal: ₱${item.price * countInCart}` : 'Add to order'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {countInCart > 0 && (
                              <button
                                onClick={() => handleRemoveItem(item)}
                                className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-zinc-300 flex items-center justify-center font-black transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {countInCart > 0 && (
                              <span className="w-6 text-center font-black text-xs text-rose-600 dark:text-rose-400">
                                {countInCart}
                              </span>
                            )}

                            <button
                              onClick={() => handleAddItem(activeStore, item)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 transition-all shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{countInCart > 0 ? 'Add more' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Selected Total</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                  ₱{totalCartCost.toLocaleString()} ({totalCartItems} items)
                </span>
              </div>

              <button
                disabled={totalCartItems === 0}
                onClick={handleProceedToBooking}
                className={`px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-md ${
                  totalCartItems > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Confirm Order via Courier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL MENU FLYER IMAGE VIEWER */}
      {viewingFlyer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileImage className="w-4 h-4 text-amber-500" />
                <span>Official Partner Store Menu Flyer</span>
              </h4>
              <button onClick={() => setViewingFlyer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={viewingFlyer}
              alt="Menu Flyer"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 dark:border-zinc-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
