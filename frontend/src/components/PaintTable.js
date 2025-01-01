import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CircularProgress from '@mui/material/CircularProgress';
import config from "./Config";

const columns = [
  { id: 'name', label: 'Paint Name', minWidth: 170 },
  { id: 'class', label: 'Class', minWidth: 130 },
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

const PaintTable = ({ onAddToSale, loading, inventory }) => {
  const [page, setPage] = useState(0);
  const [paintsByClass, setPaintsByClass] = useState({});
  const [paintClasses, setPaintClasses] = useState([]);
  const [displayedPaints, setDisplayedPaints] = useState([]);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/paint-classes`);
        const classesData = await response.json();

        // Group inventory by class
        const grouped = inventory.reduce((acc, paint) => {
          const paintClass = paint.class || 'Others';
          if (!acc[paintClass]) {
            acc[paintClass] = [];
          }
          acc[paintClass].push(paint);
          return acc;
        }, {});

        // Create final list of classes including 'Others' if needed
        let finalClasses = [...classesData];
        if (grouped['Others'] && grouped['Others'].length > 0) {
          finalClasses.push('Others');
        }

        // Add empty arrays for classes with no paints
        finalClasses.forEach(className => {
          if (!grouped[className]) {
            grouped[className] = [];
          }
        });

        setPaintClasses(finalClasses);
        setPaintsByClass(grouped);
        updateDisplayedPaints(grouped, finalClasses[0]);
      } catch (error) {
        console.error('Error fetching paint classes:', error);
      }
    };

    fetchClasses();
  }, [inventory]);

  const updateDisplayedPaints = (grouped, currentClass) => {
    if (searchActive) {
      // When searching, show all paints across all classes
      const allPaints = Object.values(grouped).flat();
      setDisplayedPaints(allPaints);
    } else {
      // When not searching, show only paints from current class
      setDisplayedPaints(grouped[currentClass] || []);
    }
  };

  useEffect(() => {
    updateDisplayedPaints(paintsByClass, paintClasses[page]);
  }, [page, paintsByClass, paintClasses, searchActive]);

  const handleChangePage = (event, newPage) => {
    if (!searchActive) {
      setPage(newPage);
    }
  };

  // This function should be called from the Inventory component when search query changes
  const handleSearch = (query) => {
    if (query) {
      setSearchActive(true);
      const allPaints = Object.values(paintsByClass).flat();
      const filtered = allPaints.filter(paint =>
        paint.name.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedPaints(filtered);
    } else {
      setSearchActive(false);
      updateDisplayedPaints(paintsByClass, paintClasses[page]);
    }
  };

  return (
    <Paper sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="white">
          {searchActive ? 'Search Results' : paintClasses[page] || 'All Paints'}
        </Typography>
        {!searchActive && (
          <Box>
            <IconButton
              onClick={(e) => handleChangePage(e, page - 1)}
              disabled={page === 0}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={(e) => handleChangePage(e, page + 1)}
              disabled={page >= paintClasses.length - 1}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
        )}
      </Box>

      <TableContainer sx={{ flexGrow: 1 }}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ height: '300px' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : displayedPaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ height: '300px' }}>
                  {searchActive ? 'No paints found matching your search' : 'No paints available in this class'}
                </TableCell>
              </TableRow>
            ) : (
              displayedPaints.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.class || 'Others'}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!searchActive && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of {paintClasses.length} ({paintClasses[page]})
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PaintTable;