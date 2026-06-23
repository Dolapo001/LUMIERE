export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
