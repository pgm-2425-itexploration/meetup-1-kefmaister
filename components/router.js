class Router {
  constructor(routes) {
    this.routes = routes; // Define the route map
    this.currentRoute = null;

    // Listen for hash changes
    window.addEventListener("hashchange", () => this.routeChanged());
    window.addEventListener("load", () => this.routeChanged());
  }

  routeChanged() {
    const hash = window.location.hash || "#/";
    const [path, queryString] = hash.split("?");
    const query = queryString
      ? Object.fromEntries(new URLSearchParams(queryString))
      : {};
    let matchedRoute = null;
    let params = {};

    // Match the hash to a route with parameters
    Object.keys(this.routes).forEach((route) => {
      const routeParts = route.split("/");
      const pathParts = path.split("/");
      if (routeParts.length === pathParts.length) {
        const match = routeParts.every((part, i) => {
          if (part.startsWith(":")) {
            params[part.slice(1)] = pathParts[i];
            return true;
          }
          return part === pathParts[i];
        });
        if (match) matchedRoute = route;
      }
    });

    const route = matchedRoute ? this.routes[matchedRoute] : null;

    if (route && typeof route.guard === "function" && !route.guard()) {
      console.warn("Access denied to route:", hash);
      if (this.routes["#/"]) {
        window.location.hash = "#/";
      }
      return;
    }

    if (route) {
      this.currentRoute = route.handler || route;
      this.currentRoute(params, query); // Call the route handler with params and query
    } else if (this.routes["#/"]) {
      window.location.hash = "#/";
    }
  }
}

export default Router;
