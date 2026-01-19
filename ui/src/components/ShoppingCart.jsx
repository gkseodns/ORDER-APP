import './ShoppingCart.css';

function ShoppingCart({ cartItems, onOrder }) {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const getItemDisplayName = (item) => {
    const optionsText = item.selectedOptions.length > 0
      ? ` (${item.selectedOptions.map(opt => opt.optionName).join(', ')})`
      : '';
    return `${item.productName}${optionsText}`;
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    onOrder();
  };

  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      {cartItems.length === 0 ? (
        <p className="empty-cart-message">장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <span className="item-name">
                    {getItemDisplayName(item)} X {item.quantity}
                  </span>
                  <span className="item-price">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cart-summary-section">
            <div className="cart-total">
              <span className="total-label">총금액</span>
              <span className="total-amount">{formatPrice(totalAmount)}</span>
            </div>
            <button 
              className="order-button" 
              onClick={handleOrder}
            >
              주문하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;
