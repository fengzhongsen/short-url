export function getOrigin() {
  return process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.PORT || 3001}`
    : window.location.origin;
}
