import { useState, useRef } from 'react';
import './ProductCard.css';

function ProductCard({ product, stock = 0, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const isOutOfStock = stock === 0;
  const isProcessingRef = useRef(false); // 중복 클릭 방지

  const handleOptionChange = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const calculatePrice = () => {
    const basePrice = product.price;
    const optionsPrice = product.options
      .filter(option => selectedOptions.includes(option.id))
      .reduce((sum, option) => sum + option.price, 0);
    return basePrice + optionsPrice;
  };

  const handleAddToCartClick = (e) => {
    // 중복 클릭 방지
    if (isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    
    const selectedOptionsData = product.options.filter(option => 
      selectedOptions.includes(option.id)
    );
    
    onAddToCart({
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      selectedOptions: selectedOptionsData.map(option => ({
        optionId: option.id,
        optionName: option.name,
        optionPrice: option.price
      })),
      quantity: 1,
      totalPrice: calculatePrice()
    });

    // 옵션 초기화
    setSelectedOptions([]);
    
    // 짧은 딜레이 후 다시 클릭 가능하도록 설정
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="image-placeholder">이미지</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">
          {product.name}
          {isOutOfStock && <span className="out-of-stock-label"> (품절)</span>}
        </h3>
        <p className="product-price">{formatPrice(calculatePrice())}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-options">
          {product.options.map(option => (
            <label key={option.id} className="option-label">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
                disabled={isOutOfStock}
              />
              <span>
                {option.name}
                {option.price > 0 && `(+${formatPrice(option.price)})`}
                {option.price === 0 && '(+0원)'}
              </span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCartClick}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
