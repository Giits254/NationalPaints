import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import config from "./Config";

const columns = [
  { id: 'name', label: 'Paint Name', minWidth: 170 },
  {
    id: 'stock',
    label: 'Available Stock',
    minWidth: 100,
    format: (value) => `${value} units`
  },
  {
    id: 'actions',
    label: 'Actions',
    minWidth: 170,
    align: 'right'
  }
];

export default function PaintTable({ onAddToSale }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paintItems, setPaintItems] = useState([]);

  useEffect(() => {
    fetchPaintItems();
  }, []);

  const fetchPaintItems = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/items`);
      if (!response.ok) throw new Error('Failed to fetch paint items');
      const data = await response.json();
      setPaintItems(data);
    } catch (error) {
      console.error('Error fetching paint items:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const currentPageItems = paintItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light' }}>
        <Typography  color="white">
          All Paints
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageItems.map((row) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <span
                    style={{
                      backgroundColor: row.stock > 50 ? '#d1fae5' : row.stock > 20 ? '#fef3c7' : '#fee2e2',
                      color: row.stock > 50 ? '#065f46' : row.stock > 20 ? '#92400e' : '#991b1b',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {row.stock} units
                  </span>
                </TableCell>
                <TableCell align="right">
                  <button
                    onClick={() => onAddToSale(row)}
                    style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Add to Sale
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={paintItems.length}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}