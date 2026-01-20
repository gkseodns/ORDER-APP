import { useState, useRef, useEffect } from 'react';
import Navigation from './components/Navigation';
import ProductCard from './components/ProductCard';
import ShoppingCart from './components/ShoppingCart';
import AdminDashboard from './components/AdminDashboard';
import InventoryStatus from './components/InventoryStatus';
import OrderStatus from './components/OrderStatus';
import { menusAPI, ordersAPI, inventoryAPI, statsAPI } from './api/client';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    receivedOrders: 0,
    inProgressOrders: 0,
    completedOrders: '0 / 0'
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 메뉴 데이터 로드
      const productsData = await menusAPI.getAll();
      setProducts(productsData.map(product => ({
        ...product,
        imageUrl: product.imageUrl || ''
      })));
      
      // 재고 데이터 로드
      const inventoryData = await inventoryAPI.getAll();
      setInventory(inventoryData);
      
      // 주문 데이터 로드 (제조완료 제외)
      const ordersData = await ordersAPI.getAll({ excludeCompleted: 'true' });
      setOrders(ordersData);
      
      // 대시보드 통계 로드
      const statsData = await statsAPI.getDashboard();
      setDashboardStats(statsData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
    
    // 관리자 페이지일 때 주기적으로 데이터 갱신 (30초마다)
    if (currentPage === 'admin') {
      const interval = setInterval(() => {
        loadData();
      }, 30000); // 30초마다 갱신
      
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  // 주문 진행중인 수량 계산 (주문접수 + 제조중 상태의 주문들)
  const inProgressOrders = orders.filter(o => o.status === '주문접수' || o.status === '제조중');
  const inProgressQuantities = inProgressOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = 0;
      }
      acc[item.productId] += item.quantity;
    });
    return acc;
  }, {});

  // 각 상품의 주문 가능 수량 계산 (재고 수량 - 주문 진행중 수량)
  const getAvailableStock = (productId) => {
    const inventoryItem = inventory.find(inv => inv.productId === productId);
    const currentStock = inventoryItem ? inventoryItem.stock : 0;
    const inProgressQty = inProgressQuantities[productId] || 0;
    return Math.max(0, currentStock - inProgressQty);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      // 현재 장바구니에 담긴 해당 상품의 총 수량 계산 (옵션 무관)
      const cartQuantityForProduct = prev
        .filter(cartItem => cartItem.productId === item.productId)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      
      // 주문 가능 수량 계산 (재고 - 주문 진행중 수량 - 장바구니에 담긴 수량)
      const availableStock = getAvailableStock(item.productId);
      const remainingStock = availableStock - cartQuantityForProduct;
      
      // 주문 가능 수량 초과 시 알림 표시하고 추가하지 않음
      if (remainingStock <= 0) {
        alert(`주문 가능 수량을 초과했습니다.\n${item.productName}의 주문 가능 수량: ${availableStock}개`);
        return prev; // 변경 없이 반환
      }
      
      // 동일한 제품+옵션 조합이 있는지 확인
      const existingIndex = prev.findIndex(cartItem => {
        if (cartItem.productId !== item.productId) return false;
        if (cartItem.selectedOptions.length !== item.selectedOptions.length) return false;
        
        const itemOptionIds = item.selectedOptions.map(opt => opt.optionId).sort();
        const cartOptionIds = cartItem.selectedOptions.map(opt => opt.optionId).sort();
        
        return JSON.stringify(itemOptionIds) === JSON.stringify(cartOptionIds);
      });

      if (existingIndex !== -1) {
        // 기존 아이템의 수량 증가
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        updated[existingIndex].totalPrice = 
          (updated[existingIndex].basePrice + 
           updated[existingIndex].selectedOptions.reduce((sum, opt) => sum + opt.optionPrice, 0)) * 
          updated[existingIndex].quantity;
        return updated;
      } else {
        // 새 아이템 추가
        return [...prev, item];
      }
    });
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    
    try {
      // 주문 데이터 생성 (장바구니 아이템을 그대로 사용)
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          options: item.selectedOptions.map(opt => ({
            optionId: opt.optionId,
            optionName: opt.optionName,
            optionPrice: opt.optionPrice
          })),
          quantity: item.quantity,
          price: item.totalPrice
        })),
        totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
      };

      // API로 주문 생성
      const createdOrder = await ordersAPI.create(orderData);
      
      alert(`주문이 완료되었습니다!\n총 금액: ${orderData.totalAmount.toLocaleString('ko-KR')}원`);
      
      // 장바구니 초기화
      setCartItems([]);
      
      // 주문 목록 새로고침
      if (currentPage === 'admin') {
        await loadData();
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      alert(`주문 생성 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleUpdateStock = async (productId, change) => {
    try {
      // API로 재고 업데이트
      const updated = await inventoryAPI.update(productId, change);
      
      // 로컬 상태 업데이트
      setInventory(prev => 
        prev.map(item => 
          item.productId === productId
            ? { ...item, stock: updated.stock }
            : item
        )
      );
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      alert(`재고 업데이트 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // API로 주문 상태 업데이트
      const updatedOrder = await ordersAPI.updateStatus(orderId, newStatus);
      
      // 로컬 상태 업데이트
      setOrders(prev => 
        prev.map(order =>
          order.id === orderId || order.orderId === orderId
            ? { ...order, ...updatedOrder, orderId: updatedOrder.id }
            : order
        )
      );
      
      // 제조완료로 변경된 경우 재고 및 통계 새로고침
      if (newStatus === '제조완료') {
        await loadData();
      } else {
        // 대시보드 통계만 새로고침
        const statsData = await statsAPI.getDashboard();
        setDashboardStats(statsData);
      }
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error);
      alert(`주문 상태 변경 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>데이터를 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'order') {
    return (
      <div className="app">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="main-content">
          <div className="products-section">
            <h1 className="section-title">메뉴</h1>
            <div className="products-grid">
              {products.map(product => {
                // 주문 가능 수량 = 재고 수량 - 주문 진행중 수량
                const availableStock = getAvailableStock(product.id);
                // 장바구니에 담긴 해당 상품의 총 수량 계산 (옵션 무관)
                const cartQuantityForProduct = cartItems
                  .filter(cartItem => cartItem.productId === product.id)
                  .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
                // 실제 주문 가능 수량 = 주문 가능 수량 - 장바구니에 담긴 수량
                const remainingStock = Math.max(0, availableStock - cartQuantityForProduct);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    stock={remainingStock}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          </div>
          <ShoppingCart cartItems={cartItems} onOrder={handleOrder} />
        </main>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className="app">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="main-content">
          <AdminDashboard stats={dashboardStats} />
          <InventoryStatus 
            inventory={inventory} 
            onUpdateStock={handleUpdateStock}
          />
          <OrderStatus 
            orders={orders.filter(o => o.status !== '제조완료')} 
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </main>
      </div>
    );
  }

  return null;
}

export default App;
