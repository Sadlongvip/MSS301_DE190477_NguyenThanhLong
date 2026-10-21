import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { PROMOTIONS } from '../../constant/landingData';

/**
 * Promo Banner Section - Khu vực Voucher & Khuyến mãi đặc biệt
 */
export function PromoBanner({ onOpenCart }) {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  return (
    <section id="promo" className="py-5" style={{ background: '#fefce8' }}>
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold mb-2">
            🎁 ƯU ĐÃI NỔI BẬT HÔM NAY
          </Badge>
          <h2 className="fw-bold text-dark display-6 mb-2">
            Mã Giảm Giá & Combo Tiết Kiệm
          </h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Thu thập voucher để tận hưởng những ly trà sữa thơm ngon với mức giá ưu đãi nhất.
          </p>
        </div>

        {/* Voucher Cards Grid */}
        <Row className="g-4">
          {PROMOTIONS.map((promo) => {
            const isCopied = copiedCode === promo.code;
            return (
              <Col md={4} key={promo.id}>
                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative bg-white">
                  {/* Top colored strip */}
                  <div
                    style={{
                      height: '6px',
                      background: 'linear-gradient(90deg, #f59e0b 0%, #854d0e 100%)',
                    }}
                  />
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <Badge bg="danger" className="px-2 py-1 rounded-pill small">
                          {promo.badge}
                        </Badge>
                        <small className="text-muted">{promo.expiry}</small>
                      </div>

                      <h4 className="fw-bold text-dark mb-1">{promo.discount}</h4>
                      <p className="text-muted small mb-4">{promo.condition}</p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border border-dashed">
                      <div className="font-monospace fw-bold text-dark px-2">
                        {promo.code}
                      </div>
                      <Button
                        variant={isCopied ? 'success' : 'warning'}
                        size="sm"
                        onClick={() => handleCopy(promo.code)}
                        className="rounded-pill px-3 py-1 fw-bold text-dark"
                      >
                        {isCopied ? (
                          <>
                            <i className="bi bi-check-lg me-1"></i> Đã chép
                          </>
                        ) : (
                          <>
                            <i className="bi bi-clipboard me-1"></i> Sao chép
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
}

export default PromoBanner;
