import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Stack,
  IconButton,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import config from "./Config";

// Custom styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transition: 'background-color 0.2s ease',
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const SalesHistory = () => {
  const [history, setHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesHistory();
  }, [startDate, endDate, buyerSearch]);

  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      let url = `${config.apiUrl}/api/sales-history`;
      const params = new URLSearchParams();

      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      }

      if (buyerSearch.trim()) {
        params.append('buyer_name', buyerSearch.trim());
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sales history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="600" color="primary">
              Sales History
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search by buyer name"
              size="small"
              value={buyerSearch}
              onChange={(e) => setBuyerSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
            <FilterAltIcon color="action" />
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: 170 }}
            />
            <Typography color="text.secondary">to</Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 170 }}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Date & Time</StyledTableCell>
                <StyledTableCell>Item</StyledTableCell>
                <StyledTableCell>Buyer</StyledTableCell>
                <StyledTableCell>Quantity</StyledTableCell>
                <StyledTableCell>Previous Stock</StyledTableCell>
                <StyledTableCell>New Stock</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((record, index) => (
                <StyledTableRow key={index}>
                  <TableCell>
                    {new Date(record.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{record.item_name}</TableCell>
                  <TableCell>{record.buyer_name}</TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{record.previous_stock}</TableCell>
                  <TableCell>{record.new_stock}</TableCell>
                </StyledTableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {loading ? 'Loading...' : 'No sales records found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesHistory;