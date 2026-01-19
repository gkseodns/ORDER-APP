import './Navigation.css';

function Navigation({ currentPage, onNavigate }) {
  return (
    <nav className="navigation">
      <div className="nav-brand">COZY</div>
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          관리자
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
