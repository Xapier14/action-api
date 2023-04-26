/*
 * RouteLogger - Express.js middleware
 * Lance Crisang - 2022
 *
 * Logs all requests to the console
 *
 */

const routeLogger = async (req, res, next) => {
  if (process.env.ROUTE_LOGGER === "true")
    console.log(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
};

export default routeLogger;
