package com.dework.orderservice.service;

import com.dework.orderservice.client.InventoryClient;
import com.dework.orderservice.dto.inventory.MilkTeaClientDto;
import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.service.PriceVerificationService.VerifiedProductInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PriceVerificationServiceTest {

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private PriceVerificationService priceVerificationService;

    private MilkTeaClientDto sampleMilkTea;
    private List<TeaSizeClientDto> sampleSizes;
    private List<ToppingClientDto> sampleToppings;

    @BeforeEach
    void setUp() {
        sampleMilkTea = MilkTeaClientDto.builder()
                .id(1L)
                .name("Trà Sữa Trân Châu Hoàng Gia")
                .price(35000.0)
                .isAvailable(true)
                .build();

        sampleSizes = List.of(
                TeaSizeClientDto.builder().id(1L).code("M").name("Size M").extraPrice(0.0).isAvailable(true).build(),
                TeaSizeClientDto.builder().id(2L).code("L").name("Size L").extraPrice(6000.0).isAvailable(true).build()
        );

        sampleToppings = List.of(
                ToppingClientDto.builder().id(1L).name("Trân châu đen").price(5000.0).isAvailable(true).build(),
                ToppingClientDto.builder().id(2L).name("Pudding trứng").price(8000.0).isAvailable(true).build()
        );
    }

    @Test
    @DisplayName("Chặn gian lận: Client gửi giá 0 đồng bị phát hiện và từ chối")
    void verifyItemPrice_ZeroPriceFraud_ThrowsBadRequest() {
        when(inventoryClient.getMilkTeaById(1L)).thenReturn(sampleMilkTea);

        // Client cố ý gửi unitPrice = 0.0đ (trong khi giá hệ thống = 35000 + 6000 + 5000 = 46000đ)
        ApiException ex = assertThrows(ApiException.class, () ->
                priceVerificationService.verifyItemPrice(1L, "L", "Trân châu đen", 0.0, sampleSizes, sampleToppings)
        );

        assertTrue(ex.getMessage().contains("không chính xác"));
        assertTrue(ex.getMessage().contains("0"));
    }

    @Test
    @DisplayName("Xác minh thành công khi đơn giá khớp chính xác với hệ thống kho")
    void verifyItemPrice_ValidPrice_Success() {
        when(inventoryClient.getMilkTeaById(1L)).thenReturn(sampleMilkTea);

        // 35000 (gốc) + 6000 (size L) + 5000 (Trân châu đen) + 8000 (Pudding trứng) = 54000
        double validPrice = 54000.0;
        VerifiedProductInfo result = priceVerificationService.verifyItemPrice(
                1L, "L", "Trân châu đen, Pudding trứng", validPrice, sampleSizes, sampleToppings
        );

        assertNotNull(result);
        assertEquals(1L, result.getMilkTeaId());
        assertEquals("Trà Sữa Trân Châu Hoàng Gia", result.getMilkTeaName());
        assertEquals(54000.0, result.getVerifiedUnitPrice());
    }

    @Test
    @DisplayName("Ném lỗi khi sản phẩm trà sữa đã tạm ngưng phục vụ")
    void verifyItemPrice_UnavailableProduct_ThrowsBadRequest() {
        sampleMilkTea.setIsAvailable(false);
        when(inventoryClient.getMilkTeaById(1L)).thenReturn(sampleMilkTea);

        ApiException ex = assertThrows(ApiException.class, () ->
                priceVerificationService.verifyItemPrice(1L, "M", "", 35000.0, sampleSizes, sampleToppings)
        );

        assertTrue(ex.getMessage().contains("tạm ngưng phục vụ"));
    }

    @Test
    @DisplayName("Ném lỗi khi topping yêu cầu không tồn tại trong kho")
    void verifyItemPrice_InvalidTopping_ThrowsBadRequest() {
        when(inventoryClient.getMilkTeaById(1L)).thenReturn(sampleMilkTea);

        ApiException ex = assertThrows(ApiException.class, () ->
                priceVerificationService.verifyItemPrice(1L, "M", "Topping Không Tồn Tại", 35000.0, sampleSizes, sampleToppings)
        );

        assertTrue(ex.getMessage().contains("không tồn tại"));
    }
}
