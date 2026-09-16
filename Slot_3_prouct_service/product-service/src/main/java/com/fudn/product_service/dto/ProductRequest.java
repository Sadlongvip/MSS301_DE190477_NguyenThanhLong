package com.fudn.product_service.dto;

import java.math.BigDecimal;
//Record product request đại diện cho dữ liệu yêu cầu từ client khi tạo hoặc cập nhật sản phẩm.
// Nó có thể chứa các trường dữ liệu như id, name, description, price,...
// hoặc bất kỳ thông tin nào khác mà bạn muốn nhận từ client khi họ gửi yêu cầu tạo hoặc cập nhật sản phẩm.
public record ProductRequest(String id, String name, String description, BigDecimal price) {
}
