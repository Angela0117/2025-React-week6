import { createHashRouter } from 'react-router-dom';
import FrontLayout from '../layouts/FrontLayout';
import HomePages from '../pages/HomePages';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';


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
      }
    ]

  }
])

export default router;
