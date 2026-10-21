import React from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';

/**
 * Hero Section - Banner chính ấn tượng cho Shop_MilkTea
 */
export function HeroSection({ onOpenCart }) {
  return (
    <section id="home" className="position-relative py-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #faf7f2 100%)' }}>
      {/* Decorative blurred background lights */}
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0) 70%)',
          top: '-10%',
          right: '-5%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(133, 77, 14, 0.15) 0%, rgba(133, 77, 14, 0) 70%)',
          bottom: '0%',
          left: '-5%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container className="position-relative" style={{ zIndex: 1 }}>
        <Row className="align-items-center gy-5">
          {/* Cột trái: Văn bản & Kêu gọi hành động */}
          <Col lg={6} className="text-center text-lg-start">
            <h1
              className="display-4 fw-bolder mb-3 text-dark"
              style={{ lineHeight: 1.15, letterSpacing: '-1.5px' }}
            >
              Hương Vị Trà Nguyên Bản{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #854d0e 0%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ngọt Ngào Từng Khoảnh Khắc
              </span>
            </h1>

            <p className="lead text-muted mb-4 fs-6" style={{ maxWidth: '520px' }}>
              Trà sữa được nấu mới từ 100% búp trà thượng hạng Mộc Châu hòa quyện cùng sữa tươi thanh trùng và trân châu đường đen dẻo bùi chuẩn vị.
            </p>

            {/* Các nút bấm hành động */}
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-3 mb-5">
              <Button
                href="#menu"
                className="btn-tea-primary px-4 py-3 fs-6 d-flex align-items-center gap-2"
              >
                <i className="bi bi-cup-straw fs-5"></i>
                <span>Xem Thực Đơn Ngay</span>
              </Button>
              <Button
                href="#promo"
                variant="outline-secondary"
                className="btn-tea-secondary px-4 py-3 fs-6 d-flex align-items-center gap-2"
              >
                <i className="bi bi-ticket-perforated fs-5"></i>
                <span>Săn Voucher 25k</span>
              </Button>
            </div>

            {/* Thống kê nổi bật */}
            <Row className="pt-3 border-top g-3 text-center text-lg-start">
              <Col xs={4}>
                <h4 className="fw-bold mb-0 text-dark">50K+</h4>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>Khách hài lòng</small>
              </Col>
              <Col xs={4}>
                <h4 className="fw-bold mb-0 text-dark">30+</h4>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>Vị trà độc quyền</small>
              </Col>
              <Col xs={4}>
                <h4 className="fw-bold mb-0 text-warning d-flex align-items-center justify-content-center justify-content-lg-start gap-1">
                  4.9 <i className="bi bi-star-fill fs-6"></i>
                </h4>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>10K+ Đánh giá</small>
              </Col>
            </Row>
          </Col>

          {/* Cột phải: Hình ảnh minh họa & Floating Cards */}
          <Col lg={6} className="text-center position-relative">
            <div className="position-relative d-inline-block">
              {/* Hình ảnh chính với hiệu ứng bo góc và đổ bóng mượt */}
              <div
                className="rounded-5 overflow-hidden shadow-lg mx-auto floating-hero-img position-relative"
                style={{
                  maxWidth: '460px',
                  height: '480px',
                  border: '8px solid #ffffff',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1558857563-b371f31ca910?w=800&auto=format&fit=crop&q=80"
                  alt="Trà sữa trân châu hoàng kim"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {/* Floating Badge: Đánh giá cao */}
              <div
                className="glass-card position-absolute p-3 d-flex align-items-center gap-3 shadow-lg"
                style={{
                  bottom: '25px',
                  left: '-20px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  minWidth: '200px',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '42px', height: '42px', background: '#f59e0b' }}
                >
                  <i className="bi bi-star-fill fs-5"></i>
                </div>
                <div className="text-start">
                  <div className="fw-bold text-dark small">Top 1 Trà Sữa</div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Được yêu thích 2026</small>
                </div>
              </div>

              {/* Floating Badge: Giao nhanh */}
              <div
                className="glass-card position-absolute p-3 d-flex align-items-center gap-3 shadow-lg"
                style={{
                  top: '40px',
                  right: '-15px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: '42px', height: '42px', background: '#15803d' }}
                >
                  <i className="bi bi-lightning-charge-fill fs-5"></i>
                </div>
                <div className="text-start">
                  <div className="fw-bold text-dark small">Giao Trong 30 Phút</div>
                  <small className="text-success fw-semibold" style={{ fontSize: '0.75rem' }}>Đá riêng mát lạnh</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default HeroSection;
