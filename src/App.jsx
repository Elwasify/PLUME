import { Routes, Route } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Discover from "./pages/Discover/Discover";
import Categories from "./pages/Categories/Categories";
import About from "./pages/About/About";
import Wishlist from "./pages/Wishlist/Wishlist";
import Cart from "./pages/Cart/Cart";
import BookDetails from "./pages/BookDetails/BookDetails";
import Author from "./pages/Author/Author";
import NotFound from "./pages/NotFound/NotFound";

export default function App() {
  return (
    <ShopProvider>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/author/:name" element={<Author />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </ShopProvider>
  );
}
