import Home from "../views/pages/home";
import Sales from "../views/pages/sales";
import Finance from "../views/pages/finance";
import Login from "../views/pages/login";
// import Detail from "../views/pages/detail";

const routes = {
  "/": Home, // default page
  "/home": Home,
  "/sales": Sales,
  "/finance": Finance,
  "/login": Login,
  // "/detail/:id": Detail,
};

export default routes;
