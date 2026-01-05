import Home from "../pages/Home/Home.jsx";
import Results from "../pages/Results/Results.jsx";
import MovieDetail from "../pages/MovieDetail/MovieDetail.jsx";


export const routes = [
  { path: "/", element: <Home /> },
  { path: "/results", element: <Results /> },
  { path: "/movie/:id", element: <MovieDetail /> }, 
  { path: '/*', element: <Home /> }
];