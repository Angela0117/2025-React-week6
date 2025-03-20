import { NavLink,Outlet } from "react-router-dom";
import router from "../router";

const routes = [
  { path: "/", name: "首頁" },
  { path: "/products", name: "產品列表" },
  { path: "/cart", name: "購物車" },
];

export default function FrontLayout() {
  return(
    <>
      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container">
          <ul className="navbar-nav flex-row gap-5 fs-5">
            {routes.map((route)=>(
              <li key={route.path} className="nav-item">
              <NavLink className="nav-link" aria-current="page" to={route.path}>{route.name}</NavLink>
            </li>
            ))}
            
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  )
}