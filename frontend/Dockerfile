# Frontend Dockerfile - build with node, serve with nginx
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage de produção com nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Remove default nginx conf and copy a minimal one if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
