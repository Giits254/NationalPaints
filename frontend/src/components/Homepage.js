import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Mail, Instagram, Facebook } from 'lucide-react';

const PaintStoreHomepage = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#1a202c', color: 'white', padding: '8px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Phone size={16} />
              <span>+254-726-994-885-PAINT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Mail size={16} />
              <span>contact@paintstore.com</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Instagram size={16} />
            <Facebook size={16} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>PaintStore</h1>
          </Link>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <Link to="/inventory" style={{ textDecoration: 'none', color: '#333' }}>Products</Link>
            <Link to="/color-guide" style={{ textDecoration: 'none', color: '#333' }}>Color Guide</Link>
            <Link to="/inspiration" style={{ textDecoration: 'none', color: '#333' }}>Inspiration</Link>
            <Link to="/services" style={{ textDecoration: 'none', color: '#333' }}>Services</Link>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Search size={20} />
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>Transform Your Space</h2>
            <p style={{ fontSize: '20px', marginBottom: '30px' }}>
              Discover our premium collection of paints and supplies for your next project
            </p>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>Featured Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {['Interior Paints', 'Exterior Paints', 'Specialty Finishes'].map((category) => (
            <div key={category} style={{
              backgroundColor: '#f3f4f6',
              padding: '24px',
              borderRadius: '8px',
              transition: 'box-shadow 0.3s'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{category}</h3>
              <button style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}>
                Browse Products →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>Our Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {['Color Consultation', 'Paint Mixing', 'Delivery Services', 'Professional Tips'].map((service) => (
              <div key={service} style={{
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{service}</h3>
                <p style={{ color: '#666' }}>Learn More →</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintStoreHomepage;