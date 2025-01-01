// PendingSales.js
import React from 'react';
import { ShoppingCart, Check, X } from 'lucide-react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

const PendingSales = ({ sales, onRemove, onConfirm }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: '1rem'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ShoppingCart size={20} style={{ color: '#1976d2' }} />
        <Typography variant="h6" component="h2" color="text.primary">
          Pending Sales
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 250px)', // Adjust based on your layout
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {sales.length === 0 ? (
          <Typography
            color="text.secondary"
            align="center"
            sx={{ py: 4 }}
          >
            No pending sales
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sales.map((sale) => (
              <Paper
                key={sale.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      maxWidth: '80%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sale.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onRemove(sale.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                 <Typography variant="body2" color="text.secondary">
                    Quantity: {sale.quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<Check size={16} />}
                    onClick={() => onConfirm(sale)}
                    sx={{ textTransform: 'none' }}
                  >
                    Confirm
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PendingSales;