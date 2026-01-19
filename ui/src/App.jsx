import { useState } from 'react';
import Navigation from './components/Navigation';
import ProductCard from './components/ProductCard';
import ShoppingCart from './components/ShoppingCart';
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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // 관리자 페이지는 나중에 구현
    if (page === 'admin') {
      alert('관리자 페이지는 준비 중입니다.');
    }
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
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        options: item.selectedOptions,
        quantity: item.quantity,
        price: item.totalPrice
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
      orderDate: new Date().toISOString()
    };

    console.log('주문 데이터:', orderData);
    alert(`주문이 완료되었습니다!\n총 금액: ${orderData.totalAmount.toLocaleString('ko-KR')}원`);
    
    // 장바구니 초기화
    setCartItems([]);
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

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content">
        <p>관리자 페이지는 준비 중입니다.</p>
      </main>
    </div>
  );
}

export default App;
