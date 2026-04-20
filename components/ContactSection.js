'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate submission — replace with Supabase insert
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="contact-section section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Get In Touch</span>
          <h2>Contact Us</h2>
          <p className="section-subtitle">
            Feel free to reach out for academic resources, events, or any inquiries!
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon"><Mail size={24} /></div>
              <div>
                <h4>Email</h4>
                <a href="mailto:publichealthsocietyunimak@gmail.com">
                  publichealthsocietyunimak@gmail.com
                </a>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon phone-icon"><Phone size={24} /></div>
              <div>
                <h4>Phone</h4>
                <a href="tel:+23279033028">+232 79 033 028</a>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon map-icon"><MapPin size={24} /></div>
              <div>
                <h4>Location</h4>
                <span>University of Makeni, Sierra Leone</span>
              </div>
            </div>

            <div className="contact-note">
              <p>
                We're here to help you with academic resources, society events, and any public health queries.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrap">
            {status === 'success' ? (
              <div className="success-message">
                <CheckCircle size={48} className="success-icon" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you shortly.</p>
                <button className="btn btn-primary" onClick={() => setStatus(null)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send a Message</h3>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Your message..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary submit-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-section {
          background: white;
        }
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .section-tag {
          display: inline-block;
          background: rgba(0, 163, 173, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(0, 163, 173, 0.3);
          padding: 0.3rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .section-header h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); margin-bottom: 1rem; }
        .section-subtitle { color: var(--muted); max-width: 600px; margin: 0 auto; font-size: 1.05rem; line-height: 1.8; }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        @media (min-width: 768px) {
          .contact-grid { grid-template-columns: 1fr 1.4fr; align-items: start; }
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.25rem;
        }
        .info-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .phone-icon { background: linear-gradient(135deg, var(--secondary), #00CFD5); }
        .map-icon { background: linear-gradient(135deg, #FFB81C, #f59e0b); }

        .info-card h4 { font-size: 0.9rem; color: var(--muted); font-weight: 500; margin-bottom: 0.25rem; }
        .info-card a, .info-card span { font-size: 0.95rem; font-weight: 600; color: var(--foreground); word-break: break-word; }
        .info-card a:hover { color: var(--secondary); }

        .contact-note {
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          border-radius: 1rem;
          padding: 1.5rem;
          color: rgba(255,255,255,0.9);
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .contact-form-wrap {
          background: var(--surface);
          border-radius: 1.5rem;
          padding: 2.5rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
        }
        .contact-form h3 { font-size: 1.5rem; margin-bottom: 1.75rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--foreground); }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          font-size: 0.95rem;
          font-family: inherit;
          background: white;
          color: var(--foreground);
          transition: var(--transition);
          resize: none;
          outline: none;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(0,163,173,0.12);
        }
        .submit-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .success-message {
          text-align: center;
          padding: 2rem 1rem;
        }
        .success-icon { color: var(--secondary); margin: 0 auto 1rem; }
        .success-message h3 { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .success-message p { color: var(--muted); margin-bottom: 2rem; }
      `}</style>
    </section>
  );
}
