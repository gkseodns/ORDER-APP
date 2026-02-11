-- 메뉴 이미지 경로 업데이트
-- ui/public 폴더의 이미지: americano-ice.jpg, americano-hot.jpg, caffe-latte.jpg

UPDATE products SET image_url = '/americano-ice.jpg', updated_at = GETDATE() WHERE name = N'아메리카노(ICE)';
UPDATE products SET image_url = '/americano-hot.jpg', updated_at = GETDATE() WHERE name = N'아메리카노(HOT)';
UPDATE products SET image_url = '/caffe-latte.jpg', updated_at = GETDATE() WHERE name = N'카페라떼';
