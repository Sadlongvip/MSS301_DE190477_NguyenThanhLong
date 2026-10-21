/**
 * Cấu hình hiển thị cho các trạng thái đơn hàng (OrderStatus)
 */
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: '#d97706',
    bgColor: '#fef3c7',
    badgeClass: 'bg-warning text-dark',
    icon: 'bi-clock-history',
    desc: 'Đơn hàng đang chờ nhân viên cửa hàng tiếp nhận và xác nhận.',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    badgeClass: 'bg-info text-dark',
    icon: 'bi-check2-circle',
    desc: 'Đơn hàng đã được xác nhận và đưa vào hàng chờ pha chế.',
  },
  PREPARING: {
    label: 'Đang pha chế',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    badgeClass: 'bg-primary text-white',
    icon: 'bi-cup-straw',
    desc: 'Bartender đang chuẩn bị trà sữa và đóng gói cẩn thận cho bạn.',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: '#2563eb',
    bgColor: '#dbeafe',
    badgeClass: 'bg-info text-white',
    icon: 'bi-bicycle',
    desc: 'Shipper đang trên đường giao trà sữa đến địa chỉ của bạn.',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: '#16a34a',
    bgColor: '#dcfce7',
    badgeClass: 'bg-success text-white',
    icon: 'bi-check-circle-fill',
    desc: 'Đơn hàng đã giao thành công. Chúc bạn thưởng thức ngon miệng!',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: '#dc2626',
    bgColor: '#fee2e2',
    badgeClass: 'bg-danger text-white',
    icon: 'bi-x-circle-fill',
    desc: 'Đơn hàng đã bị hủy.',
  },
};

/**
 * Cấu hình hiển thị cho trạng thái thanh toán (PaymentStatus)
 */
export const PAYMENT_STATUS_CONFIG = {
  UNPAID: {
    label: 'Chưa thanh toán',
    badgeClass: 'border border-secondary text-secondary bg-light',
    icon: 'bi-hourglass-split',
  },
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'border border-success text-success bg-success bg-opacity-10',
    icon: 'bi-check-circle',
  },
  FAILED: {
    label: 'Thanh toán lỗi',
    badgeClass: 'border border-danger text-danger bg-danger bg-opacity-10',
    icon: 'bi-exclamation-circle',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    badgeClass: 'border border-info text-info bg-info bg-opacity-10',
    icon: 'bi-arrow-counterclockwise',
  },
};

/**
 * Cấu hình hiển thị cho phương thức thanh toán (PaymentMethod)
 */
export const PAYMENT_METHOD_CONFIG = {
  COD: {
    label: 'Tiền mặt khi nhận hàng (COD)',
    icon: 'bi-cash-coin',
  },
  VNPAY: {
    label: 'Cổng thanh toán VNPay',
    icon: 'bi-qr-code-scan',
  },
  MOMO: {
    label: 'Ví MoMo',
    icon: 'bi-wallet2',
  },
  BANKING: {
    label: 'Chuyển khoản ngân hàng',
    icon: 'bi-bank',
  },
};

/**
 * Định dạng ngày giờ thân thiện theo chuẩn Việt Nam (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'Vừa xong';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Định dạng tiền tệ VND (ví dụ: 50.000 đ)
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('vi-VN')} đ`;
}
