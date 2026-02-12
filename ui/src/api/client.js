// API 클라이언트 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 공통 API 호출 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API 호출 실패');
    }

    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
}

// 메뉴 API
export const menusAPI = {
  // 모든 메뉴 목록 조회
  getAll: async () => {
    const response = await apiCall('/menus');
    return response.data;
  },
  
  // 특정 메뉴 조회
  getById: async (id) => {
    const response = await apiCall(`/menus/${id}`);
    return response.data;
  },
};

// 주문 API
export const ordersAPI = {
  // 주문 생성
  create: async (orderData) => {
    const response = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  },
  
  // 주문 목록 조회
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    const response = await apiCall(endpoint);
    return response.data;
  },
  
  // 특정 주문 조회
  getById: async (id) => {
    const response = await apiCall(`/orders/${id}`);
    return response.data;
  },
  
  // 주문 상태 변경
  updateStatus: async (id, status) => {
    const response = await apiCall(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },
};

// 재고 API
export const inventoryAPI = {
  // 재고 목록 조회
  getAll: async () => {
    const response = await apiCall('/inventory');
    return response.data;
  },
  
  // 재고 수량 변경
  update: async (id, change) => {
    const response = await apiCall(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ change }),
    });
    return response.data;
  },
};

// 통계 API
export const statsAPI = {
  // 대시보드 통계 조회
  getDashboard: async () => {
    const response = await apiCall('/stats/dashboard');
    return response.data;
  },
};

// 관리자 부분 갱신 API (전체현황 + 재고현황 + 주문현황만 한 번에)
export const adminAPI = {
  getPartial: async () => {
    const response = await apiCall('/admin/partial');
    return response.data;
  },
};
