# Sử dụng Node.js bản nhẹ (Alpine) làm môi trường chạy
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng cache của Docker
COPY package.json package-lock.json* ./

# Cài đặt tất cả thư viện
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng Vite và tệp server.ts
RUN npm run build

# Xóa các gói devDependencies (nhẹ vùng nhớ)
RUN npm prune --production

# Expose cổng 3000 (mặc định của Express theo setup hiện tại hoặc 8080 tùy ý)
EXPOSE 3000

# Khởi động Node Server
CMD ["npm", "run", "start"]
