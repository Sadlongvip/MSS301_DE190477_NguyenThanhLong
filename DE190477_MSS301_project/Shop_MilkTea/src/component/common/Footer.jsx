import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * Footer Component - Chân trang thông tin toàn diện cho Shop_MilkTea
 */
export function Footer() {
  return (
    <footer id="contact" className="pt-5 pb-4 text-white" style={{ background: '#1c1917' }}>
      <Container>
        <Row className="gy-4 mb-5">
          {/* Cột 1: Thông tin thương hiệu */}
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #854d0e 0%, #d97706 100%)',
                  fontSize: '1.2rem',
                }}
              >
                <i className="bi bi-cup-hot-fill"></i>
              </div>
              <span className="fw-bold fs-4 text-white">
                Shop <span style={{ color: '#f59e0b' }}>MilkTea</span>
              </span>
            </div>
            <p className="text-secondary small mb-3" style={{ lineHeight: 1.7, maxWidth: '320px' }}>
              Thương hiệu trà sữa nguyên bản từ búp trà tươi Mộc Châu. Cam kết đem đến trải nghiệm đồ uống chuẩn vị, an toàn và ngập tràn niềm vui mỗi ngày.
            </p>
            {/* Social Icons */}
            <div className="d-flex gap-2">
              {['bi-facebook', 'bi-instagram', 'bi-tiktok', 'bi-youtube'].map((icon, idx) => (
                <a
                  key={idx}
                  href={`#${icon}`}
                  className="rounded-circle d-flex align-items-center justify-content-center text-white text-decoration-none border border-secondary"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <i className={`bi ${icon} small`}></i>
                </a>
              ))}
            </div>
          </Col>

          {/* Cột 2: Danh mục nhanh */}
          <Col lg={2} md={6}>
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Khám Phá
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><a href="#home" className="text-secondary text-decoration-none hover-white">Trang Chủ</a></li>
              <li><a href="#menu" className="text-secondary text-decoration-none hover-white">Menu Trà Sữa</a></li>
              <li><a href="#promo" className="text-secondary text-decoration-none hover-white">Mã Khuyến Mãi</a></li>
              <li><a href="#about" className="text-secondary text-decoration-none hover-white">Về Chúng Tôi</a></li>
              <li><a href="#reviews" className="text-secondary text-decoration-none hover-white">Đánh Giá Khách Hàng</a></li>
            </ul>
          </Col>

          {/* Cột 3: Giờ mở cửa & Chi nhánh */}
          <Col lg={3} md={6}>
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Hệ Thống Cửa Hàng
            </h6>
            <div className="small text-secondary d-flex flex-column gap-2">
              <div className="d-flex gap-2">
                <i className="bi bi-geo-alt-fill text-warning mt-1"></i>
                <span><strong>Hà Nội:</strong> 123 Phố Trà Sữa, Q. Cầu Giấy</span>
              </div>
              <div className="d-flex gap-2">
                <i className="bi bi-geo-alt-fill text-warning mt-1"></i>
                <span><strong>TP.HCM:</strong> 456 Đường Nguyễn Huệ, Quận 1</span>
              </div>
              <div className="d-flex gap-2">
                <i className="bi bi-clock-fill text-warning mt-1"></i>
                <span><strong>Giờ phục vụ:</strong> 08:00 - 23:00 (Hằng ngày)</span>
              </div>
            </div>
          </Col>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <Col lg={3} md={6}>
            <h6 className="fw-bold text-white mb-3 text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Liên Hệ & CSKH
            </h6>
            <div className="small text-secondary d-flex flex-column gap-2 mb-3">
              <div className="d-flex gap-2">
                <i className="bi bi-telephone-fill text-warning"></i>
                <span>Hotline: <strong className="text-white">1900 6868 (Miễn phí)</strong></span>
              </div>
              <div className="d-flex gap-2">
                <i className="bi bi-envelope-fill text-warning"></i>
                <span>support@shopmilktea.vn</span>
              </div>
            </div>
            <div className="p-2 rounded-3 border border-secondary small bg-dark">
              <span className="text-warning fw-bold d-block">⚡ Giao Hàng Siêu Tốc</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Giao tận nơi trong vòng 30 phút</span>
            </div>
          </Col>
        </Row>

        {/* Bản quyền */}
        <div className="border-top border-secondary pt-3 text-center small text-secondary">
          <p className="mb-0">
            © {new Date().getFullYear()} <strong>Shop_MilkTea</strong>. Dự án MSS301 - Tất cả quyền được bảo lưu.
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
