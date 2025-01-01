import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Check, X } from 'lucide-react';
import QuantityPopup from './QuantityPopup';
import PaintTable from './PaintTable';
import PendingSales from './PendingSales';
import config from "./Config";

const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  // New debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredInventory(inventory);
      } else {
        const filtered = inventory.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredInventory(filtered);
      }
    }, 300); // 300ms delay for better performance

    return () => clearTimeout(timeoutId);
  }, [searchQuery, inventory]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // Dismiss after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/items`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventory(data);
      setFilteredInventory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const addToPendingSales = (item) => {
    const existingSale = pendingSales.find((sale) => sale.id === item.id);
    if (existingSale) {
      if (existingSale.quantity < item.stock) {
        setPendingSales(
          pendingSales.map((sale) =>
            sale.id === item.id
              ? { ...sale, quantity: sale.quantity + 1 }
              : sale
          )
        );
      } else {
        setNotification({ type: 'error', message: 'Not enough stock available' });
      }
    } else {
      setPendingSales([...pendingSales, { ...item, quantity: 1 }]);
    }
  };

  const removePendingSale = (itemId) => {
    setPendingSales(pendingSales.filter((sale) => sale.id !== itemId));
  };

  const confirmSale = async (sale) => {
  try {
    const response = await fetch(`${config.apiUrl}/api/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sale.name,
        quantity: sale.quantity,
        buyerName: sale.buyerName, // Add buyer name to the API request
      }),
    });

    if (!response.ok) throw new Error('Failed to process sale');

    setNotification({
      type: 'success',
      message: `Sold ${sale.quantity} ${sale.name} to ${sale.buyerName}`
    });
    removePendingSale(sale.id);
    fetchInventory();
  } catch (error) {
    setNotification({ type: 'error', message: 'Failed to process sale' });
  }
};
  const handleAddToSale = (item) => {
    setSelectedItem(item);
  };

  const handleQuantityConfirm = (item, quantity, buyerName) => {
  const existingSale = pendingSales.find((sale) => sale.id === item.id);
  if (existingSale) {
    if (existingSale.quantity + quantity <= item.stock) {
      setPendingSales(
        pendingSales.map((sale) =>
          sale.id === item.id
            ? { ...sale, quantity: sale.quantity + quantity, buyerName }
            : sale
        )
      );
    } else {
      setNotification({ type: 'error', message: 'Not enough stock available' });
    }
  } else {
    setPendingSales([...pendingSales, { ...item, quantity, buyerName }]);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Paint Store Inventory</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search paints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg max-w-md mx-auto ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="h-[600px]"> {/* Fixed height container */}
              <PaintTable
                onAddToSale={handleAddToSale}
                loading={loading}
                inventory={filteredInventory}
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <PendingSales
              sales={pendingSales}
              onRemove={removePendingSale}
              onConfirm={confirmSale}
            />
          </div>
        </div>

        {selectedItem && (
          <QuantityPopup
            item={selectedItem}
            onConfirm={handleQuantityConfirm}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryTable;