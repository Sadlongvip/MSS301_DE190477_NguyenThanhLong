/**
 * Module xác thực dữ liệu cho Thực đơn & Kho hàng (Milk Tea, Category, Topping, Size)
 * Dùng cho các form React-Bootstrap chuẩn mực.
 */

/**
 * Kiểm tra form Món trà sữa
 */
export function validateMilkTeaForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) {
    errors.name = 'Tên món trà sữa không được để trống';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Tên món trà sữa phải có ít nhất 2 ký tự';
  }

  if (form.price === '' || form.price === null || form.price === undefined) {
    errors.price = 'Giá bán không được để trống';
  } else if (Number(form.price) < 1000) {
    errors.price = 'Giá bán tối thiểu là 1.000 đ';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Vui lòng chọn danh mục cho món';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Kiểm tra form Danh mục trà sữa
 */
export function validateCategoryForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Kiểm tra form Topping
 */
export function validateToppingForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) {
    errors.name = 'Tên topping không được để trống';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Tên topping phải có ít nhất 2 ký tự';
  }

  if (form.price === '' || form.price === null || form.price === undefined) {
    errors.price = 'Giá topping không được để trống';
  } else if (Number(form.price) < 0) {
    errors.price = 'Giá topping không thể là số âm';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Kiểm tra form Size ly
 */
export function validateSizeForm(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) {
    errors.name = 'Tên size không được để trống (Ví dụ: Size M)';
  }

  if (!form.code || !form.code.trim()) {
    errors.code = 'Mã size không được để trống (Ví dụ: M, L, XL)';
  } else if (form.code.trim().length > 10) {
    errors.code = 'Mã size tối đa 10 ký tự';
  }

  if (form.extraPrice === '' || form.extraPrice === null || form.extraPrice === undefined) {
    errors.extraPrice = 'Phụ thu không được để trống';
  } else if (Number(form.extraPrice) < 0) {
    errors.extraPrice = 'Phụ thu không thể là số âm';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
