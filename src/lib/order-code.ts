export function generateOrderCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const id = String(Math.floor(100000 + Math.random() * 900000));
  return `ORD-${y}${m}${d}-${id}`;
}
