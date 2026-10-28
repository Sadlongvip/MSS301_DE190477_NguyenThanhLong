package com.dework.orderservice.service;

import com.dework.orderservice.client.InventoryClient;
import com.dework.orderservice.dto.inventory.MilkTeaClientDto;
import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import com.dework.orderservice.exception.ApiException;
import feign.FeignException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceVerificationService {

    private final InventoryClient inventoryClient;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifiedProductInfo {
        private Long milkTeaId;
        private String milkTeaName;
        private Double verifiedUnitPrice;
        private String image;

        public double getVerifiedUnitPrice() {
            return verifiedUnitPrice != null ? verifiedUnitPrice : 0.0;
        }
    }

    /**
     * Lấy toàn bộ danh sách size từ inventory-service
     */
    public List<TeaSizeClientDto> getAllSizes() {
        try {
            return inventoryClient.getAllSizes();
        } catch (Exception e) {
            log.error("Lỗi khi kết nối đến inventory-service để lấy danh sách kích cỡ: {}", e.getMessage());
            throw ApiException.badRequest("Không thể kết nối đến dịch vụ kho (inventory-service) để kiểm tra kích cỡ.");
        }
    }

    /**
     * Lấy toàn bộ danh sách topping từ inventory-service
     */
    public List<ToppingClientDto> getAllToppings() {
        try {
            return inventoryClient.getToppings();
        } catch (Exception e) {
            log.error("Lỗi khi kết nối đến inventory-service để lấy danh sách topping: {}", e.getMessage());
            throw ApiException.badRequest("Không thể kết nối đến dịch vụ kho (inventory-service) để kiểm tra topping.");
        }
    }

    /**
     * Xác minh đơn giá sản phẩm dựa trên dữ liệu chuẩn từ inventory-service.
     * Ném ra ApiException.badRequest nếu giá gửi lên không khớp (chống gian lận giá 0đ)
     * hoặc nếu món/size/topping không tồn tại hoặc đã ngừng phục vụ.
     */
    public VerifiedProductInfo verifyItemPrice(
            Long milkTeaId,
            String size,
            String toppings,
            double clientUnitPrice,
            List<TeaSizeClientDto> allSizes,
            List<ToppingClientDto> allToppings
    ) {
        if (milkTeaId == null) {
            throw ApiException.badRequest("ID sản phẩm trà sữa không được để trống");
        }

        MilkTeaClientDto milkTea;
        try {
            milkTea = inventoryClient.getMilkTeaById(milkTeaId);
        } catch (FeignException.NotFound e) {
            throw ApiException.badRequest("Không tìm thấy món trà sữa với ID: " + milkTeaId);
        } catch (Exception e) {
            log.error("Lỗi khi kết nối sang inventory-service lấy món {}: {}", milkTeaId, e.getMessage());
            throw ApiException.badRequest("Không thể xác minh thông tin sản phẩm từ hệ thống kho. Vui lòng thử lại sau!");
        }

        if (milkTea == null) {
            throw ApiException.badRequest("Không tìm thấy món trà sữa với ID: " + milkTeaId);
        }

        if (Boolean.FALSE.equals(milkTea.getIsAvailable())) {
            throw ApiException.badRequest("Món '" + milkTea.getName() + "' hiện đang tạm ngưng phục vụ");
        }

        double basePrice = milkTea.getPrice();

        // 1. Phụ thu size
        double sizeExtraPrice = 0.0;
        if (size != null && !size.isBlank() && allSizes != null) {
            String trimmedSize = size.trim();
            TeaSizeClientDto matchedSize = allSizes.stream()
                    .filter(s -> (s.getCode() != null && s.getCode().equalsIgnoreCase(trimmedSize))
                            || (s.getName() != null && s.getName().equalsIgnoreCase(trimmedSize)))
                    .findFirst()
                    .orElse(null);

            if (matchedSize != null) {
                if (Boolean.FALSE.equals(matchedSize.getIsAvailable())) {
                    throw ApiException.badRequest("Size '" + size + "' cho món '" + milkTea.getName() + "' hiện không khả dụng");
                }
                sizeExtraPrice = matchedSize.getExtraPrice();
            } else {
                log.warn("Không tìm thấy cấu hình size '{}' cho món '{}', phụ thu size là 0đ", size, milkTea.getName());
            }
        }

        // 2. Phụ thu toppings
        double toppingsTotalPrice = 0.0;
        if (toppings != null && !toppings.isBlank() && allToppings != null) {
            List<String> toppingNames = Arrays.stream(toppings.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();

            for (String topName : toppingNames) {
                ToppingClientDto matchedTopping = allToppings.stream()
                        .filter(t -> t.getName() != null && t.getName().equalsIgnoreCase(topName))
                        .findFirst()
                        .orElse(null);

                if (matchedTopping == null) {
                    throw ApiException.badRequest(String.format("Topping '%s' không tồn tại trong hệ thống", topName));
                }

                if (Boolean.FALSE.equals(matchedTopping.getIsAvailable())) {
                    throw ApiException.badRequest(String.format("Topping '%s' hiện đã hết hàng", matchedTopping.getName()));
                }

                toppingsTotalPrice += matchedTopping.getPrice();
            }
        }

        double calculatedUnitPrice = basePrice + sizeExtraPrice + toppingsTotalPrice;

        // Cách 1: Kiểm tra chống gian lận giá (sai số tối đa 1.0đ)
        if (Math.abs(clientUnitPrice - calculatedUnitPrice) > 1.0) {
            log.warn("Phát hiện sai lệch đơn giá: món '{}' (id={}), client gửi={}, hệ thống tính={}",
                    milkTea.getName(), milkTeaId, clientUnitPrice, calculatedUnitPrice);
            throw ApiException.badRequest(String.format(
                    "Đơn giá của món '%s' không chính xác (Client gửi: %,.0fđ, Giá hệ thống: %,.0fđ). Vui lòng làm mới giỏ hàng!",
                    milkTea.getName(), clientUnitPrice, calculatedUnitPrice
            ));
        }

        return VerifiedProductInfo.builder()
                .milkTeaId(milkTea.getId())
                .milkTeaName(milkTea.getName())
                .verifiedUnitPrice(calculatedUnitPrice)
                .image(milkTea.getImage())
                .build();
    }
}
