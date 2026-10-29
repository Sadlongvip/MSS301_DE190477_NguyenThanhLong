import React from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

export default function PageLoadingFallback() {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5 my-5" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" variant="warning" role="status" style={{ width: '3.5rem', height: '3.5rem' }}>
        <span className="visually-hidden">Đang tải trang...</span>
      </Spinner>
      <p className="mt-3 text-muted fw-semibold fs-6">Đang tải nội dung, vui lòng chờ trong giây lát...</p>
    </Container>
  );
}

