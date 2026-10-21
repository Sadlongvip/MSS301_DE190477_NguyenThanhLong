import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import useOrder from '../../hook/useOrder';

const TABS = [
  { key: 'ALL', label: 'Tất Cả', icon: 'bi-grid-fill' },
  { key: 'PENDING', label: 'Chờ Xác Nhận', icon: 'bi-clock-history' },
  { key: 'CONFIRMED', label: 'Đã Xác Nhận', icon: 'bi-check2-circle' },
  { key: 'PREPARING', label: 'Đang Pha Chế', icon: 'bi-cup-straw' },
  { key: 'DELIVERING', label: 'Đang Giao Hàng', icon: 'bi-bicycle' },
  { key: 'COMPLETED', label: 'Hoàn Thành', icon: 'bi-check-circle-fill' },
  { key: 'CANCELLED', label: 'Đã Hủy', icon: 'bi-x-circle-fill' },
];

/**
 * OrderFilterTabs - Thanh lọc trạng thái đơn hàng dạng tab cuộn ngang mượt mà
 */
export function OrderFilterTabs() {
  const { statusFilter, setStatusFilter, orderCounts } = useOrder();

  return (
    <div className="order-filter-tabs-wrapper mb-4">
      <Nav
        variant="pills"
        className="gap-2 flex-nowrap overflow-auto py-2 px-1 border-bottom"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = orderCounts[tab.key] || 0;

          return (
            <Nav.Item key={tab.key} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 transition-all ${
                  isActive
                    ? 'btn-tea-primary shadow-sm'
                    : 'btn-outline-secondary border-0 bg-light text-secondary'
                }`}
                style={{ fontSize: '0.85rem' }}
              >
                <i className={`bi ${tab.icon}`}></i>
                <span>{tab.label}</span>
                {count > 0 && (
                  <Badge
                    pill
                    bg={isActive ? 'light' : 'secondary'}
                    text={isActive ? 'dark' : 'white'}
                    className="ms-1 px-2 py-1"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            </Nav.Item>
          );
        })}
      </Nav>
    </div>
  );
}

export default OrderFilterTabs;
