package com.dework.orderservice.service;

import com.dework.orderservice.dto.cart.AddToCartRequest;
import com.dework.orderservice.dto.cart.CartResponse;
import com.dework.orderservice.dto.inventory.TeaSizeClientDto;
import com.dework.orderservice.dto.inventory.ToppingClientDto;
import com.dework.orderservice.exception.ApiException;
import com.dework.orderservice.model.Cart;
import com.dework.orderservice.model.CartItem;
import com.dework.orderservice.repository.CartRepository;
import com.dework.orderservice.service.PriceVerificationService.VerifiedProductInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final PriceVerificationService priceVerificationService;

    public CartResponse getCart(Long userId, String sessionId) {
        Cart cart = findCart(userId, sessionId);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse addToCart(AddToCartRequest request, Long currentUserId) {
        Cart cart;
        if (currentUserId != null) {
            cart = cartRepository.findByUserId(currentUserId)
                    .orElseGet(() -> Cart.builder().userId(currentUserId).build());
        } else if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            String sid = request.getSessionId().trim();
            cart = cartRepository.findBySessionId(sid)
                    .orElseGet(() -> Cart.builder().sessionId(sid).build());
        } else {
            throw ApiException.badRequest("Cần cung cấp thông tin người dùng hoặc sessionId để thêm vào giỏ hàng");
        }

        List<TeaSizeClientDto> allSizes = priceVerificationService.getAllSizes();
        List<ToppingClientDto> allToppings = priceVerificationService.getAllToppings();
        VerifiedProductInfo verified = priceVerificationService.verifyItemPrice(
                request.getMilkTeaId(),
                request.getSize(),
                request.getToppings(),
                request.getUnitPrice(),
                allSizes,
                allToppings
        );

        boolean matched = false;
        for (CartItem existingItem : cart.getItems()) {
            if (isSameItem(existingItem, request)) {
                int newQuantity = existingItem.getQuantity() + request.getQuantity();
                existingItem.setQuantity(newQuantity);
                existingItem.setUnitPrice(verified.getVerifiedUnitPrice());
                existingItem.setTotalPrice(verified.getVerifiedUnitPrice() * newQuantity);
                matched = true;
                break;
            }
        }

        if (!matched) {
            CartItem newItem = CartItem.builder()
                    .milkTeaId(verified.getMilkTeaId())
                    .milkTeaName(verified.getMilkTeaName())
                    .size(request.getSize())
                    .sugar(request.getSugar())
                    .ice(request.getIce())
                    .toppings(request.getToppings())
                    .quantity(request.getQuantity())
                    .unitPrice(verified.getVerifiedUnitPrice())
                    .totalPrice(verified.getVerifiedUnitPrice() * request.getQuantity())
                    .image(request.getImage() != null && !request.getImage().isBlank() ? request.getImage() : verified.getImage())
                    .note(request.getNote())
                    .build();
            cart.getItems().add(newItem);
        }

        cart.recalculateTotals();
        Cart saved = cartRepository.save(cart);
        log.info("Item added to cart: cartId={}, totalItems={}", saved.getId(), saved.getTotalQuantity());
        return CartResponse.from(saved);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Long userId, String sessionId, int itemIndex, int quantity) {
        Cart cart = findCart(userId, sessionId);

        if (itemIndex < 0 || itemIndex >= cart.getItems().size()) {
            throw ApiException.badRequest("Vị trí sản phẩm trong giỏ hàng không hợp lệ: " + itemIndex);
        }

        if (quantity <= 0) {
            cart.getItems().remove(itemIndex);
        } else {
            CartItem item = cart.getItems().get(itemIndex);
            item.setQuantity(quantity);
            item.setTotalPrice(item.getUnitPrice() * quantity);
        }

        cart.recalculateTotals();
        Cart saved = cartRepository.save(cart);
        return CartResponse.from(saved);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, String sessionId, int itemIndex) {
        Cart cart = findCart(userId, sessionId);

        if (itemIndex < 0 || itemIndex >= cart.getItems().size()) {
            throw ApiException.badRequest("Vị trí sản phẩm trong giỏ hàng không hợp lệ: " + itemIndex);
        }

        cart.getItems().remove(itemIndex);
        cart.recalculateTotals();
        Cart saved = cartRepository.save(cart);
        return CartResponse.from(saved);
    }

    @Transactional
    public void clearCart(Long userId, String sessionId) {
        Cart cart = findCart(userId, sessionId);
        cart.getItems().clear();
        cart.recalculateTotals();
        cartRepository.save(cart);
        log.info("Cart cleared: cartId={}", cart.getId());
    }

    private Cart findCart(Long userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        }
        if (sessionId != null && !sessionId.isBlank()) {
            String sid = sessionId.trim();
            return cartRepository.findBySessionId(sid)
                    .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sid).build()));
        }
        throw ApiException.badRequest("Cần cung cấp userId hoặc sessionId để xác định giỏ hàng");
    }

    private boolean isSameItem(CartItem item, AddToCartRequest req) {
        return Objects.equals(item.getMilkTeaId(), req.getMilkTeaId())
                && Objects.equals(item.getSize(), req.getSize())
                && Objects.equals(item.getSugar(), req.getSugar())
                && Objects.equals(item.getIce(), req.getIce())
                && Objects.equals(item.getToppings(), req.getToppings());
    }
}
