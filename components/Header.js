'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, User } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Team', href: '/#team' },
    { name: 'Contact', href: '/#contact' },
    { name: 'Library', href: '/library' },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <Link href="/" className="logo">
          <img src="/images/unimak (9).jpeg" alt="Unimak Public Health Logo" className="logo-img" />
          <span className="logo-text">Unimak Public Health</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="nav-link">
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="btn btn-primary btn-sm admin-btn">
            <User size={16} />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className="mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link 
          href="/login" 
          className="btn btn-primary mobile-admin-btn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <User size={18} />
          <span>Admin Login</span>
        </Link>
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: var(--transition);
        }

        .header.scrolled {
          padding: 1rem 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          box-shadow: var(--shadow-md);
          border-bottom: 1px solid var(--border);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.25rem;
          font-family: 'Outfit', sans-serif;
          color: var(--primary);
        }

        .logo-img {
          height: 40px;
          width: auto;
          border-radius: 8px;
          object-fit: contain;
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex;
          }
        }

        .nav-link {
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
        }

        .nav-link:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--secondary);
          transition: var(--transition);
        }

        .nav-link:hover:after {
          width: 100%;
        }

        .admin-btn {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .mobile-toggle {
          display: block;
          color: var(--primary);
        }

        @media (min-width: 1024px) {
          .mobile-toggle {
            display: none;
          }
        }

        .mobile-nav {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          height: 100vh;
          background: white;
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 6rem 2rem;
          gap: 1.5rem;
          transition: 0.4s ease-in-out;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }

        .mobile-nav.open {
          right: 0;
        }

        .mobile-link {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--primary);
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }

        .mobile-admin-btn {
          margin-top: 1rem;
          width: 100%;
        }
      `}</style>
    </header>
  );
};

export default Header;
