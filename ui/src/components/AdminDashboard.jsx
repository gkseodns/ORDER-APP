import './AdminDashboard.css';

function AdminDashboard({ stats }) {
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">관리자 대시보드</h2>
      <div className="dashboard-stats">
        <div className="stat-box">
          <div className="stat-label">총 수량</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">수량 접수</div>
          <div className="stat-value">{stats.receivedOrders}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">제조 중</div>
          <div className="stat-value">{stats.inProgressOrders}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">제조 완료</div>
          <div className="stat-value">{stats.completedOrders}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
