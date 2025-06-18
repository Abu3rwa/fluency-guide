import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./routes";

const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: <AppRoutes />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
