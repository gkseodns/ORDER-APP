import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ProductCard from './components/ProductCard';
import ShoppingCart from './components/ShoppingCart';
import AdminDashboard from './components/AdminDashboard';
import InventoryStatus from './components/InventoryStatus';
import OrderStatus from './components/OrderStatus';
import './App.css';

// 임시 커피 메뉴 데이터
const coffeeProducts = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원하고 깔끔한 아이스 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop&q=80',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻하고 진한 핫 아메리카노',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드럽고 고소한 카페라떼',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&q=80',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '우유 거품이 풍부한 카푸치노',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 5,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 시럽이 들어간 라떼',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&q=80',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 6,
    name: '카라멜마키아토',
    price: 6000,
    description: '카라멜 시럽과 거품이 어우러진 마키아토',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState('order');
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([
    { productId: 1, productName: '아메리카노(ICE)', stock: 10 },
    { productId: 2, productName: '아메리카노(HOT)', stock: 10 },
    { productId: 3, productName: '카페라떼', stock: 10 },
    { productId: 4, productName: '카푸치노', stock: 10 },
    { productId: 5, productName: '바닐라라떼', stock: 10 },
    { productId: 6, productName: '카라멜마키아토', stock: 10 }
  ]);

  // 대시보드 통계 계산
  // 총 수량: 제조완료되지 않은 주문의 커피 주문 수량 (아이템 총 개수)
  // 주문 접수: 주문접수 상태인 주문 건수
  const dashboardStats = {
    totalOrders: orders
      .filter(o => o.status !== '제조완료') // 제조완료된 주문 제외
      .reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0), // 제조완료되지 않은 주문의 아이템 수량 합계
    receivedOrders: orders.filter(o => o.status === '주문접수').length, // 주문접수 상태인 주문 건수
    inProgressOrders: orders.filter(o => o.status === '제조중').length,
    completedOrders: orders.filter(o => o.status === '제조완료').length
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
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

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // 주문 데이터 생성
    const orderData = {
      orderId: Date.now(), // 간단한 ID 생성
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        options: item.selectedOptions,
        quantity: item.quantity,
        price: item.totalPrice
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
      orderDate: new Date().toISOString(),
      status: '주문접수'
    };

    // 주문 목록에 추가
    setOrders(prev => [orderData, ...prev]);
    
    alert(`주문이 완료되었습니다!\n총 금액: ${orderData.totalAmount.toLocaleString('ko-KR')}원`);
    
    // 장바구니 초기화
    setCartItems([]);
  };

  const handleUpdateStock = (productId, change) => {
    setInventory(prev => 
      prev.map(item => 
        item.productId === productId
          ? { ...item, stock: Math.max(0, item.stock + change) }
          : item
      )
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => {
      const orderToUpdate = prev.find(order => order.orderId === orderId);
      
      // 제조완료로 변경될 때만 재고 차감
      if (newStatus === '제조완료' && orderToUpdate && orderToUpdate.status !== '제조완료') {
        // 주문의 각 아이템마다 해당 상품의 재고를 개별적으로 차감
        orderToUpdate.items.forEach(orderItem => {
          setInventory(currentInventory => 
            currentInventory.map(invItem => {
              // 각 상품의 productId가 일치하는 경우에만 해당 주문 아이템의 수량만큼 차감
              if (invItem.productId === orderItem.productId) {
                return {
                  ...invItem,
                  stock: Math.max(0, invItem.stock - orderItem.quantity)
                };
              }
              return invItem;
            })
          );
        });
      }
      
      return prev.map(order =>
        order.orderId === orderId
          ? { ...order, status: newStatus }
          : order
      );
    });
  };

  if (currentPage === 'order') {
    return (
      <div className="app">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="main-content">
          <div className="products-section">
            <h1 className="section-title">메뉴</h1>
            <div className="products-grid">
              {coffeeProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
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
