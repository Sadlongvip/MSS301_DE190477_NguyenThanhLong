import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FEATURES } from '../../constant/landingData';

/**
 * WhyChooseUs Section - Khẳng định chất lượng và giá trị thương hiệu
 */
export function WhyChooseUs() {
  return (
    <section id="about" className="py-5" style={{ background: '#ffffff' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <Badge bg="info" className="px-3 py-2 rounded-pill fw-bold mb-2 text-white">
            🌿 CAM KẾT CHẤT LƯỢNG
          </Badge>
          <h2 className="fw-bold text-dark display-6 mb-2">
            Tại Sao Bạn Sẽ Mê Shop_MilkTea?
          </h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Chúng tôi tỉ mỉ trong từng công đoạn từ chọn lá trà, nấu trân châu cho tới đóng gói giao tận tay bạn.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <Row className="g-4">
          {FEATURES.map((item) => (
            <Col md={6} lg={3} key={item.id}>
              <Card className="glass-card h-100 p-4 border-0 text-center text-md-start">
                <div
                  className="rounded-4 d-inline-flex align-items-center justify-content-center mb-4 mx-auto mx-md-0 shadow-sm"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: item.bgColor,
                    color: item.color,
                    fontSize: '1.75rem',
                  }}
                >
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default WhyChooseUs;
