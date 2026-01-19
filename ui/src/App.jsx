import { useState, useRef } from 'react';
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
  // 재고 차감 처리된 주문 추적 (중복 차감 방지)
  const processedOrdersRef = useRef(new Set());

  // 대시보드 통계 계산
  // 총 수량: 제조완료되지 않은 주문의 커피 주문 수량 (아이템 총 개수)
  // 주문 접수: 주문접수 상태인 주문 건수
  // 제조완료: 제조완료된 주문의 커피 수량 / 제조완료된 주문 건수
  const completedOrders = orders.filter(o => o.status === '제조완료');
  const completedQuantity = completedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  const dashboardStats = {
    totalOrders: orders
      .filter(o => o.status !== '제조완료') // 제조완료된 주문 제외
      .reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0), // 제조완료되지 않은 주문의 아이템 수량 합계
    receivedOrders: orders.filter(o => o.status === '주문접수').length, // 주문접수 상태인 주문 건수
    inProgressOrders: orders.filter(o => o.status === '제조중').length,
    completedOrders: `${completedQuantity} / ${completedOrders.length}` // 제조완료 커피 수량 / 제조완료 주문 건수
  };

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

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // 주문 데이터 생성 (장바구니 아이템을 그대로 사용)
    const orderData = {
      orderId: Date.now(), // 간단한 ID 생성
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        options: item.selectedOptions,
        quantity: item.quantity, // 장바구니의 quantity를 그대로 사용
        price: item.totalPrice
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
      orderDate: new Date().toISOString(),
      status: '주문접수'
    };

    // 디버깅: 주문 데이터 확인
    console.log('주문 데이터:', JSON.stringify(orderData, null, 2));
    console.log('주문 아이템들:', orderData.items.map(item => `${item.productName} X ${item.quantity}`));

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
    // 주문 상태 업데이트
    setOrders(prev => {
      const orderToUpdate = prev.find(order => order.orderId === orderId);
      
      // 제조완료로 변경될 때만 재고 차감
      if (newStatus === '제조완료' && orderToUpdate && orderToUpdate.status !== '제조완료') {
        // 이미 처리된 주문인지 확인 (중복 차감 방지)
        if (processedOrdersRef.current.has(orderId)) {
          console.warn(`주문 ${orderId}는 이미 처리되었습니다. 재고 차감을 건너뜁니다.`);
          return prev.map(order =>
            order.orderId === orderId
              ? { ...order, status: newStatus }
              : order
          );
        }
        
        // 처리된 주문으로 표시
        processedOrdersRef.current.add(orderId);
        
        // 주문 아이템 데이터를 복사 (참조 문제 방지)
        const orderItems = JSON.parse(JSON.stringify(orderToUpdate.items));
        
        // 디버깅: 재고 차감 전 데이터 확인
        console.log('=== 재고 차감 시작 ===');
        console.log('주문 ID:', orderId);
        console.log('주문 아이템들:', orderItems.map(item => `${item.productName} (ID: ${item.productId}) X ${item.quantity}`));
        
        // 재고 차감 처리 (setOrders 밖에서 처리)
        setInventory(currentInventory => {
          // 재고 맵 생성 (깊은 복사)
          const inventoryMap = new Map();
          currentInventory.forEach(item => {
            inventoryMap.set(item.productId, { ...item });
          });
          
          // 디버깅: 재고 차감 전 재고 상태
          console.log('재고 차감 전:', Array.from(inventoryMap.values()).map(item => `${item.productName} (ID: ${item.productId}): ${item.stock}개`));
          
          // 주문의 각 아이템을 순회하면서 해당 상품의 재고 차감
          orderItems.forEach((orderItem, index) => {
            const invItem = inventoryMap.get(orderItem.productId);
            if (invItem && orderItem.quantity > 0) {
              // 해당 주문 아이템의 수량만큼만 재고 차감
              const currentStock = invItem.stock;
              const deductAmount = orderItem.quantity;
              const newStock = Math.max(0, currentStock - deductAmount);
              console.log(`[${index + 1}] ${orderItem.productName} (ID: ${orderItem.productId}): ${currentStock}개 - ${deductAmount}개 = ${newStock}개`);
              inventoryMap.set(orderItem.productId, {
                ...invItem,
                stock: newStock
              });
            } else {
              console.warn(`재고를 찾을 수 없거나 수량이 0입니다: ${orderItem.productName} (ID: ${orderItem.productId})`);
            }
          });
          
          // 디버깅: 재고 차감 후 재고 상태
          console.log('재고 차감 후:', Array.from(inventoryMap.values()).map(item => `${item.productName} (ID: ${item.productId}): ${item.stock}개`));
          console.log('=== 재고 차감 완료 ===');
          
          // 맵을 배열로 변환
          return Array.from(inventoryMap.values());
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
              {coffeeProducts.map(product => {
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
