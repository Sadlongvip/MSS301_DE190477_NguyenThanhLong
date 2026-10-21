import React, { useState, useMemo, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { InventoryContext } from '../../context/InventoryContext';
import { CATEGORIES as FALLBACK_CATEGORIES, PRODUCTS as FALLBACK_PRODUCTS } from '../../constant/landingData';

const DEFAULT_TEA_IMAGE = 'https://images.unsplash.com/photo-1558857563-b37cfb8cb468?auto=format&fit=crop&w=600&q=80';

/**
 * Featured Menu Section - Thực đơn nổi bật với bộ lọc danh mục và tìm kiếm nhanh
 * Ưu tiên hiển thị dữ liệu từ Backend thông qua InventoryContext (API Gateway)
 * Có Fallback an toàn sang dữ liệu mẫu nếu Backend chưa sẵn sàng.
 */
export function FeaturedMenu({ onSelectProduct, onQuickAdd }) {
  const { categories: beCategories, milkTeas: beMilkTeas } = useContext(InventoryContext) || {};

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Chuẩn hóa danh mục (Ưu tiên BE, fallback sang static)
  const displayCategories = useMemo(() => {
    if (beCategories && beCategories.length > 0) {
      return [
        { id: 'all', name: 'Tất Cả', icon: 'bi-grid-fill' },
        ...beCategories.map((c) => ({
          id: String(c.id),
          name: c.name,
          icon: 'bi-cup-straw',
        })),
      ];
    }
    return FALLBACK_CATEGORIES;
  }, [beCategories]);

  // Chuẩn hóa danh sách sản phẩm (Ưu tiên BE, fallback sang static)
  const displayProducts = useMemo(() => {
    if (beMilkTeas && beMilkTeas.length > 0) {
      return beMilkTeas.map((item, idx) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Hương vị trà thơm béo chuẩn gu.',
        price: item.price,
        image: item.image || DEFAULT_TEA_IMAGE,
        category: String(item.categoryId),
        categoryName: item.categoryName,
        rating: 4.8 + (idx % 3) * 0.1,
        reviewsCount: 120 + idx * 15,
        tag: item.isAvailable === false ? 'Tạm hết' : idx < 3 ? 'Bán chạy' : 'Mới',
        tagColor: item.isAvailable === false ? 'secondary' : idx < 3 ? 'danger' : 'warning',
        isAvailable: item.isAvailable !== false,
      }));
    }
    return FALLBACK_PRODUCTS;
  }, [beMilkTeas]);

  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((item) => {
      const matchCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'best-seller'
          ? item.tag === 'Bán chạy' || item.rating >= 4.9
          : item.category === activeCategory;

      const matchKeyword =
        !searchKeyword.trim() ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.description.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCategory && matchKeyword;
    });
  }, [displayProducts, activeCategory, searchKeyword]);

  return (
    <section id="menu" className="py-5" style={{ background: '#faf7f2' }}>
      <Container>
        {/* Section Title */}
        <div className="text-center mb-4">
          <Badge bg="success" className="px-3 py-2 rounded-pill fw-bold mb-2">
            🧋 MENU ĐẶC BIỆT
          </Badge>
          <h2 className="fw-bold text-dark display-6 mb-2">Thực Đơn Trà Sữa Chuẩn Gu</h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Hương vị trà hảo hạng pha trộn cùng sữa tươi béo ngậy và đa dạng topping nhà làm thơm ngon khó cưỡng.
          </p>
        </div>

        {/* Thanh tìm kiếm & Bộ lọc Category */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-5">
          {/* Category Tabs */}
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {displayCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'warning' : 'light'}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-pill px-3 py-2 small fw-bold d-flex align-items-center gap-2 border ${
                  activeCategory === cat.id ? 'shadow-sm text-dark' : 'text-muted bg-white'
                }`}
              >
                <i className={`bi ${cat.icon}`}></i>
                <span>{cat.name}</span>
              </Button>
            ))}
          </div>

          {/* Ô tìm kiếm món */}
          <div style={{ maxWidth: '280px', width: '100%' }}>
            <InputGroup size="sm" className="shadow-sm rounded-pill overflow-hidden border">
              <InputGroup.Text className="bg-white border-0 ps-3">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm món trà sữa..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="border-0 shadow-none py-2"
              />
              {searchKeyword && (
                <Button
                  variant="white"
                  className="border-0 pe-3 text-muted"
                  onClick={() => setSearchKeyword('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </Button>
              )}
            </InputGroup>
          </div>
        </div>

        {/* Grid sản phẩm */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>
              <i className="bi bi-search"></i>
            </div>
            <h5 className="fw-bold text-dark">Không tìm thấy món phù hợp</h5>
            <p className="text-muted small">Hãy thử tìm với từ khóa khác hoặc chọn danh mục khác nhé!</p>
          </div>
        ) : (
          <Row className="g-4">
            {filteredProducts.map((product) => (
              <Col xs={12} sm={6} lg={3} key={product.id}>
                <Card className="product-card">
                  {/* Ảnh sản phẩm */}
                  <div className="product-img-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img"
                      loading="lazy"
                    />
                    <span className={`badge-custom-tag bg-${product.tagColor || 'warning'}`}>
                      {product.tag}
                    </span>
                  </div>

                  {/* Chi tiết nội dung card */}
                  <Card.Body className="p-3 d-flex flex-column">
                    {/* Đánh giá & Calo */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-warning fw-bold d-flex align-items-center gap-1">
                        <i className="bi bi-star-fill"></i>
                        <span>{product.rating}</span>
                        <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>
                          ({product.reviewsCount})
                        </span>
                      </span>
                      {product.calories && (
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {product.calories}
                        </span>
                      )}
                    </div>

                    {/* Tên món */}
                    <h6 className="fw-bold text-dark mb-1 text-truncate" title={product.name}>
                      {product.name}
                    </h6>

                    {/* Mô tả ngắn */}
                    <p
                      className="text-muted small mb-3 flex-grow-1"
                      style={{
                        fontSize: '0.78rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.6em',
                      }}
                    >
                      {product.description}
                    </p>

                    {/* Giá tiền và nút hành động */}
                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <div>
                        <span className="fw-bold text-danger fs-6 d-block lh-1">
                          {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        {product.originalPrice && (
                          <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.72rem' }}>
                            {product.originalPrice.toLocaleString('vi-VN')} đ
                          </small>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => onSelectProduct(product)}
                        className="btn-tea-primary px-3 py-1 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <i className="bi bi-plus-lg"></i>
                        <span>Tùy chọn</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}

export default FeaturedMenu;
