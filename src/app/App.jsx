import { useRoutes } from "react-router-dom";
import { routes } from "./routes.jsx";
import { FavoritesProvider } from "../context/favoritesContext.jsx";

export default function App() {
  const element = useRoutes(routes);

  return <FavoritesProvider>{element}</FavoritesProvider>;
};



