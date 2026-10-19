/**
 * Middleware para simular delay en respuestas del servidor
 * Útil para testing y simulación de condiciones de red lentas
 */
const delayMiddleware = (ms = 5000) => {
  return (req, res, next) => {
    setTimeout(() => {
      next();
    }, ms);
  };
};

module.exports = delayMiddleware;

