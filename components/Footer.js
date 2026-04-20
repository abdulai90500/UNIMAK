'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <div className="logo-icon">PH</div>
            <span>Unimak Public Health</span>
          </Link>
          <p className="footer-desc">
            Empowering the next generation of public health leaders at the University of Makeni. 
            Providing excellence in epidemiology and laboratory sciences.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">FB</a>
            <a href="#" className="social-link">IG</a>
            <a href="#" className="social-link">X</a>
            <a href="#" className="social-link"><Globe size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/#home">Home</Link></li>
            <li><Link href="/#about">About Us</Link></li>
            <li><Link href="/#services">Services</Link></li>
            <li><Link href="/#team">Executive Members</Link></li>
            <li><Link href="/library">Academic Library</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Information</h4>
          <ul className="contact-list">
            <li>
              <Mail size={18} className="contact-icon" />
              <span>publichealthsocietyunimak@gmail.com</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+232 79 033 028</span>
            </li>
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>University of Makeni, Sierra Leone</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>&copy; {currentYear} Unimak Public Health Society Portal. All Rights Reserved.</p>
          <div className="bottom-links">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--primary);
          color: white;
          padding: 4rem 0 0;
          margin-top: 4rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          padding-bottom: 4rem;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: white;
          color: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .footer-desc {
          opacity: 0.8;
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .social-link:hover {
          background: var(--secondary);
          transform: translateY(-3px);
        }

        h4 {
          color: white;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        h4::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 2px;
          background: var(--secondary);
        }

        .footer-links ul {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links a {
          opacity: 0.8;
        }

        .footer-links a:hover {
          opacity: 1;
          padding-left: 5px;
          color: var(--secondary);
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          opacity: 0.8;
        }

        .contact-icon {
          color: var(--secondary);
          flex-shrink: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 0;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .bottom-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .bottom-container {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .bottom-links {
          display: flex;
          gap: 2rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
