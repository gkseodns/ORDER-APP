-- 커피 주문 앱 데이터베이스 스키마
-- MSSQL (SQL Server) 버전

-- 1. 제품 테이블 (메뉴)
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description NVARCHAR(500),
    image_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- 2. 제품 옵션 테이블 (샷 추가, 시럽 추가 등)
CREATE TABLE product_options (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. 재고 테이블
CREATE TABLE inventory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    stock INT NOT NULL DEFAULT 0,
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. 주문 테이블
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    total_amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT '대기',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CHECK (status IN ('대기', '주문접수', '제조중', '제조완료'))
);

-- 5. 주문 아이템 테이블
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    item_total_price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. 주문 아이템 옵션 테이블 (주문 시 선택한 옵션)
CREATE TABLE order_item_options (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_item_id INT NOT NULL,
    option_id INT,
    option_name NVARCHAR(100) NOT NULL,
    option_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES product_options(id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_product_options_product_id ON product_options(product_id);

-- 초기 데이터 삽입 (예시 데이터)
-- 1. 제품 데이터
INSERT INTO products (name, price, description, image_url) VALUES
(N'아메리카노(ICE)', 4000, N'시원하고 깔끔한 아이스 아메리카노', 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=400&fit=crop&q=80'),
(N'아메리카노(HOT)', 4000, N'따뜻하고 진한 핫 아메리카노', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop'),
(N'카페라떼', 5000, N'부드럽고 고소한 카페라떼', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&q=80'),
(N'카푸치노', 5000, N'우유 거품이 풍부한 카푸치노', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'),
(N'바닐라라떼', 5500, N'달콤한 바닐라 시럽이 들어간 라떼', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&q=80'),
(N'카라멜마키아토', 6000, N'카라멜 시럽과 거품이 어우러진 마키아토', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop');

-- 2. 제품 옵션 데이터 (모든 제품에 공통 옵션)
-- CURSOR 대신 각 제품 ID를 직접 사용하여 INSERT
INSERT INTO product_options (product_id, name, price)
SELECT id, N'샷 추가', 500 FROM products
UNION ALL
SELECT id, N'시럽 추가', 0 FROM products;

-- 3. 재고 데이터 (각 제품당 초기 재고 10개)
INSERT INTO inventory (product_id, stock)
SELECT id, 10 FROM products;
