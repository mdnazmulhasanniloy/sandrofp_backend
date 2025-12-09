 

## 📁 Run in Docker

---

##  1. Stop Old Containers (Recommended)

Run this if you previously started Docker:

```sh
docker-compose down
docker system prune -af
```

---

##  2. Build the Docker Image

If you changed your code, rebuild your images:

```sh
docker-compose build
```

Build without cache:

```sh
docker-compose build --no-cache
```

---

## 3. Start Your Application

Run all services in the background:

```sh
docker-compose up -d
```

---

## 4. Check Logs

View live logs for the Node.js app:

```sh
docker-compose logs -f app
```

---

## 🌐 Your Services Will Run On:

| Service       | Port | URL                                            |
| ------------- | ---- | ---------------------------------------------- |
| API Server    | 6000 | [http://localhost:6000](http://localhost:6000) |
| Socket Server | 6005 | ws://localhost:6005                            |
| Redis         | 6379 | localhost:6379                                 |

---

## 🔥 Updating Your Code (Very Important)

When you change code in the project:

### 1️⃣ Stop containers

```sh
docker-compose down
```

### 2️⃣ Rebuild image

```sh
docker-compose build
```

### 3️⃣ Start again

```sh
docker-compose up -d
```

Your latest code is now live.

---

## ⚠️ Important Fixes

### ❌ Remove this line from `docker-compose.yml`:

```yml
version: '3.8'
```

Docker Compose v2 ignores it.

---

### ❌ Fix your Dockerfile

Replace:

```Dockerfile
COPY --from=builder /app/. .
```

With:

```Dockerfile
COPY --from=builder /app/dist ./dist
```

This prevents copying entire workspace twice.

---

## 🧰 Common Useful Commands

### Stop All Containers

```sh
docker-compose down
```

### Remove All Containers, Images, Cache

```sh
docker system prune -af
```

### Check Running Containers

```sh
docker ps
```

### Restart Container

```sh
docker-compose restart app
```

---

 
