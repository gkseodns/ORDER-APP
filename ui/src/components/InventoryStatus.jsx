import './InventoryStatus.css';

function InventoryStatus({ inventory, onUpdateStock }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-out' };
    if (stock < 5) return { text: '주의', className: 'status-warning' };
    return { text: '정상', className: 'status-normal' };
  };

  const handleIncrease = (productId) => {
    onUpdateStock(productId, 1);
  };

  const handleDecrease = (productId) => {
    const product = inventory.find(item => item.productId === productId);
    if (product && product.stock > 0) {
      onUpdateStock(productId, -1);
    }
  };

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-grid">
        {inventory.map(item => {
          const status = getStockStatus(item.stock);
          return (
            <div key={item.productId} className="inventory-card">
              <div className="product-header">
                <div className="product-name">{item.productName}</div>
                <div className="stock-info">
                  <span className="stock-quantity">{item.stock} 개</span>
                  <span className={`stock-status ${status.className}`}>
                    {status.text}
                  </span>
                </div>
              </div>
              <div className="stock-controls">
                <button 
                  className="stock-button decrease"
                  onClick={() => handleDecrease(item.productId)}
                  disabled={item.stock === 0}
                >
                  -
                </button>
                <button 
                  className="stock-button increase"
                  onClick={() => handleIncrease(item.productId)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InventoryStatus;
