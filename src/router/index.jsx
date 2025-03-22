import { createHashRouter } from 'react-router-dom';
import FrontLayout from '../layouts/FrontLayout';
import HomePages from '../pages/HomePages';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import NotFound from '../pages/NotFound';

//path命名依據為FrontLayout中的routes
const router = createHashRouter([
  {
    path: '/',
    element: <FrontLayout />,
    children: [
      {
        path: '',
        element: <HomePages />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />,
  }
])

export default router;

