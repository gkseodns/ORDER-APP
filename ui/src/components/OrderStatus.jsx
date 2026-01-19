import './OrderStatus.css';

function OrderStatus({ orders, onUpdateOrderStatus }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const getItemDisplayName = (item) => {
    // options 또는 selectedOptions 모두 지원 (데이터 구조 호환성)
    const itemOptions = item.options || item.selectedOptions || [];
    const optionsText = itemOptions.length > 0
      ? ` (${itemOptions.map(opt => opt.optionName || opt.name).join(', ')})`
      : '';
    return `${item.productName}${optionsText}`;
  };

  const handleStatusChange = (orderId, newStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
  };

  const getStatusButton = (order) => {
    if (order.status === '주문접수') {
      return (
        <button
          className="status-button receive"
          onClick={() => handleStatusChange(order.orderId, '제조중')}
        >
          제조 시작
        </button>
      );
    } else if (order.status === '제조중') {
      return (
        <button
          className="status-button complete"
          onClick={() => handleStatusChange(order.orderId, '제조완료')}
        >
          제조 완료
        </button>
      );
    } else {
      return (
        <span className="status-completed">완료</span>
      );
    }
  };

  if (orders.length === 0) {
    return (
      <div className="order-status">
        <h2 className="order-title">주문현황</h2>
        <p className="empty-orders">주문이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="order-status">
      <h2 className="order-title">주문현황</h2>
      <div className="order-list">
        {orders.map(order => (
          <div key={order.orderId} className="order-item">
            <div className="order-info">
              <div className="order-header">
                <div className="order-date">{formatDate(order.orderDate)}</div>
                <div className="order-price">{formatPrice(order.totalAmount)}</div>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={`${order.orderId}-${item.productId}-${index}`} className="order-item-detail">
                    {getItemDisplayName(item)} X {item.quantity}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-action">
              {getStatusButton(order)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderStatus;
