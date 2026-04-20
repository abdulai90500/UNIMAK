import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Unimak Public Health Society Portal",
  description: "Your hub for academic notes and exam resources at the University of Makeni",
  keywords: "public health, UNIMAK, University of Makeni, epidemiology, laboratory sciences, academic resources",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
