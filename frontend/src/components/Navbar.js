// Navbar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { LightMode, DarkMode } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import logo from './logo.png';

const Navbar = ({ darkMode, toggleTheme, onLogout, userRole }) => {
  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        backgroundColor: darkMode ? '#1e1e1e' : 'white',
        mb: 3,
        borderBottom: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: '64px' }}>
        {/* Logo Container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100px',
            padding: '8px 0',
          }}
        >
          <img
            src={logo}
            alt="National Paints"
            style={{
              height: '130px',
              width: 'auto',
              marginTop: '115px',
              filter: darkMode ? 'brightness(0.8)' : 'none',
              transform: 'scale(1.4)',
              transformOrigin: 'left center',
            }}
          />
        </Box>

        {/* Right side buttons */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mr: 13
        }}>
          {/* Only show Admin button if user is admin */}
          {userRole === 'admin' && (
            <Button
              component={Link}
              to="/admin"
              variant="contained"
              sx={{
                bgcolor: darkMode ? '#2196f3' : '#1976d2',
                '&:hover': {
                  bgcolor: darkMode ? '#1e88e5' : '#1565c0',
                },
                textTransform: 'none',
                px: 3
              }}
            >
              Admin
            </Button>
          )}

          <Button
            component={Link}
            to="/inventory"
            variant="contained"
            sx={{
              bgcolor: darkMode ? '#2196f3' : '#1976d2',
              '&:hover': {
                bgcolor: darkMode ? '#1e88e5' : '#1565c0',
              },
              textTransform: 'none',
              px: 3
            }}
          >
            Inventory
          </Button>

          <Button
            component={Link}
            to="/sales-history"
            variant="contained"
            sx={{
              bgcolor: darkMode ? '#2196f3' : '#1976d2',
              '&:hover': {
                bgcolor: darkMode ? '#1e88e5' : '#1565c0',
              },
              textTransform: 'none',
              px: 3
            }}
          >
            Sales History
          </Button>

          <IconButton
            onClick={toggleTheme}
            sx={{
              color: darkMode ? '#fff' : '#000'
            }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Add Logout button */}
          <Button
            onClick={onLogout}
            variant="contained"
            sx={{
              bgcolor: darkMode ? '#f44336' : '#d32f2f',
              '&:hover': {
                bgcolor: darkMode ? '#d32f2f' : '#c62828',
              },
              textTransform: 'none',
              px: 3
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;