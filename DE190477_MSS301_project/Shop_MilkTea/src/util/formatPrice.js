/**
 * Định dạng tiền tệ VND (ví dụ: 50.000 đ)
 */
export function formatPrice(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('vi-VN')} đ`;
}

export const formatCurrency = formatPrice;

export default formatPrice;
