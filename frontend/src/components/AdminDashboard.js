import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import UserManagement from './UserManagement';
import config from './Config';
import {Search} from "lucide-react";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    stock: 0,
    class: 'Solid Colors'
  });
  const combineNameAndCode = (name, code) => {
    return `${name.trim()} - ${code.trim()}`;
  };
  const [error, setError] = useState(null);
  const [paintClasses, setPaintClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchPaintClasses();
  }, []);

  const formatNameWithCode = (name) => {
    if (!name) return '';
    const parts = name.split(' - ');
    return parts.length > 1 ? `${parts[0]} - ${parts[1]}` : name;
  };

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchQuery.trim() === '') {
          setFilteredProducts(products);
        } else {
          const filtered = products.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredProducts(filtered);
        }
      }, 300); // 300ms delay for better performance

      return () => clearTimeout(timeoutId);
    }, [searchQuery, products]);

  const fetchPaintClasses = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/paint-classes`);
      if (!response.ok) throw new Error('Failed to fetch paint classes');
      const data = await response.json();
      setPaintClasses(data);
    } catch (error) {
      console.error('Error fetching paint classes:', error);
      setError('Failed to load paint classes');
    }
  };

  const handleAddPaintClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setError('Class name is required');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/paint-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName.trim() })
      });

      if (!response.ok) throw new Error('Failed to add paint class');

      setNewClassName('');
      fetchPaintClasses();
      setSuccessMessage('Paint class added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to add paint class');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/items`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data || []);
      setFilteredProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.code.trim()) {
      setError('Both product name and code are required');
      return;
    }

    const combinedName = combineNameAndCode(newProduct.name, newProduct.code);

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: combinedName,
          stock: parseInt(newProduct.stock),
          class: newProduct.class
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      setNewProduct({ name: '', code: '', stock: 0, class: 'Solid Colors' });
      fetchProducts();
      setError(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message || 'Failed to add product');
    }
  };

  // Helper function to split name and code for display
  const splitNameAndCode = (combinedName) => {
    const parts = combinedName.split(' - ');
    return {
      name: parts[0] || '',
      code: parts[1] || ''
    };
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct?.id || !editingProduct.name.trim()) {
      setError('Invalid product data');
      return;
    }
    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (!response.ok) throw new Error('Failed to update product');
      setEditingProduct(null);
      fetchProducts();
      setError(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/admin/products/${productId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        fetchProducts();
        setError(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };
 const PaintClassesManager = () => {
  const [localNewClassName, setLocalNewClassName] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localNewClassName.trim()) {
      setError('Class name is required');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/paint-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: localNewClassName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add paint class');
      }

      setLocalNewClassName('');
      fetchPaintClasses();
      setSuccessMessage('Paint class added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to add paint class');
    }
  };

  const handleUpdateClass = async (originalName) => {
    if (!editingValue || !editingValue.trim()) {
      setError('Class name is required');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/paint-classes/${encodeURIComponent(originalName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingValue.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update paint class');
      }

      setEditingClassId(null);
      setEditingValue('');
      fetchPaintClasses();
      setSuccessMessage('Paint class updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update paint class');
    }
  };

  const startEditing = (className) => {
    setEditingClassId(className);
    setEditingValue(className);
  };

  const cancelEditing = () => {
    setEditingClassId(null);
    setEditingValue('');
  };

  const handleDeleteClass = async (className) => {
    if (window.confirm(`Are you sure you want to delete the paint class "${className}"?`)) {
      try {
        const response = await fetch(`${config.apiUrl}/api/admin/paint-classes/${encodeURIComponent(className)}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
  const errorData = await response.json();
  setError(errorData.message || 'Failed to delete paint class');

    // Clear error after 3 seconds
    setTimeout(() => {
      setError(null);
    }, 2000);

  throw new Error(errorData.message || 'Failed to delete paint class');
}

        fetchPaintClasses();
        setSuccessMessage('Paint class deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setError(error.message || 'Failed to delete paint class');
      }
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Paint Classes Management</Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          '& .MuiTextField-root': { flex: 1 }
        }}
      >
        <TextField
          label="New Paint Class Name"
          value={localNewClassName}
          onChange={(e) => setLocalNewClassName(e.target.value)}
          required
          autoComplete="off"
          inputProps={{
            autoComplete: 'off',
            form: {
              autoComplete: 'off',
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Class
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Existing Paint Classes</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paintClasses.map((className, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingClassId === className ? (
                    <TextField
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                  ) : (
                    className
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingClassId === className ? (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateClass(className)}
                        startIcon={<SaveIcon />}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        size="small"
                        onClick={cancelEditing}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => startEditing(className)}
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClass(className)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Products Management" />
          <Tab label="Paint Classes" />
            <Tab label="User Management" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          {/* Add New Product Form */}

    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Add New Product</Typography>

      <Box component="form" onSubmit={handleAddProduct} sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 2 }}>

          <TextField
            label="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            sx={{ flex: 2 }}
            placeholder="Enter product name"
          />
          <TextField
            label="Product Code"
            value={newProduct.code}
            onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
            required
            sx={{ flex: 1 }}
            placeholder="Enter code"
          />
        </Box>
       <TextField
          type="number"
          label="Stock"
          value={newProduct.stock}
          onChange={(e) => {
            const value = e.target.value;
            const newValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
            setNewProduct({ ...newProduct, stock: newValue });
          }}
          required
          sx={{ flex: 1 }}
          InputProps={{
            inputProps: { min: 0 }
          }}
        />
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Paint Class</InputLabel>
          <Select
            value={newProduct.class}
            label="Paint Class"
            onChange={(e) => setNewProduct({ ...newProduct, class: e.target.value })}
          >
            {paintClasses.map((paintClass) => (
              <MenuItem key={paintClass} value={paintClass}>
                {paintClass}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Add Product
        </Button>
      </Box>
    </Paper>


          {/* Products Table */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
    </div>

    <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Name - Code
              <Tooltip title="Product name followed by product code">
                <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
              </Tooltip>
            </TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Class</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No products available</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => product && (
                <TableRow key={product.id}>
              <TableCell>
                {editingProduct?.id === product.id ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      value={splitNameAndCode(editingProduct.name).name}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        name: combineNameAndCode(e.target.value, splitNameAndCode(editingProduct.name).code)
                      })}
                      size="small"
                      sx={{ flex: 2 }}
                      placeholder="Product Name"
                    />
                    <TextField
                      value={splitNameAndCode(editingProduct.name).code}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        name: combineNameAndCode(splitNameAndCode(editingProduct.name).name, e.target.value)
                      })}
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="Code"
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="span" sx={{ mr: 1 }}>
                      {splitNameAndCode(product.name).name}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: '#FFFFFF',
                        bgcolor: '#69aef8',
                        px: 0.6,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {splitNameAndCode(product.name).code}
                    </Typography>
                  </Box>
                )}
              </TableCell>
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <TextField
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                        size="small"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProduct?.id === product.id ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editingProduct.class}
                          onChange={(e) => setEditingProduct({ ...editingProduct, class: e.target.value })}
                        >
                          {paintClasses.map((paintClass) => (
                            <MenuItem key={paintClass} value={paintClass}>
                              {paintClass}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      product.class
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingProduct?.id === product.id ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={handleUpdateProduct}
                          startIcon={<SaveIcon />}
                        >
                          Save
                        </Button>
                        <Button
                          variant="contained"
                          color="inherit"
                          size="small"
                          onClick={() => setEditingProduct(null)}
                          startIcon={<CancelIcon />}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => setEditingProduct(product)}
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteProduct(product.id)}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
        </>
        ) : activeTab === 1 ? (
          <PaintClassesManager />
        ) : (
          <UserManagement />
        )}
    </Box>
  );
};

export default AdminDashboard;