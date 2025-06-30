export const isAuthRoute = (path) => {
  return ["/", "/maintenance"].includes(path);
};
