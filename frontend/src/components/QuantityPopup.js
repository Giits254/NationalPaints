import React from 'react';
import { X } from 'lucide-react';

const QuantityPopup = ({ item, onConfirm, onClose }) => {
  const [quantity, setQuantity] = React.useState(1);
  const [buyerName, setBuyerName] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      // Add simple validation for buyer name
      alert('Please enter a buyer name');
      return;
    }
    onConfirm(item, parseInt(quantity), buyerName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Quantity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Buyer Name</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter buyer name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              {item.name} (Available: {item.stock} units)
            </label>
            <input
              type="number"
              min="1"
              max={item.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add to Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityPopup;