import { useSmoothScroll } from "@hooks/useSmoothScroll";
import AppRoutes from "@routes/AppRoutes.jsx";

function App() {
  // Initialize Lenis smooth scroll + GSAP ticker sync once at the root.
  useSmoothScroll();

  return <AppRoutes />;
}

export default App;
