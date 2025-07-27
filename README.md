# Fullstack Intern Challenge

### Скрины проекта

![image](https://github.com/user-attachments/assets/8a1fd09f-dff7-47ee-a5ff-3ae3d2ea5384)
![image](https://github.com/user-attachments/assets/95fcb48a-3edf-44be-ac2f-7ee3348d3135)



## Описание

Учебный fullstack-проект для стажировки: кошачий пинтерест. Реализован фронтенд на React + Vite и бэкенд на NestJS + TypeORM + PostgreSQL. Используется внешний API для получения картинок котиков.

## Технологии

### Фронтенд
- **React** — современная библиотека для построения пользовательских интерфейсов
- **Vite** — быстрый сборщик и dev-сервер
- **TypeScript** — типизация для надёжного кода
- **CSS Grid/Flexbox** — адаптивная и современная вёрстка

### Бэкенд
- **NestJS** — прогрессивный Node.js фреймворк для серверных приложений
- **TypeORM** — ORM для работы с PostgreSQL
- **PostgreSQL** — надёжная реляционная база данных
- **Docker** — контейнеризация сервисов

## Запуск

1. Клонируйте репозиторий
2. Установите зависимости для фронта и бэка:
   - `cd front && npm install`
   - `cd ../api && npm install`
3. Запустите через Docker Compose:
   - `docker compose up --build`
4. Откройте [http://localhost:8080](http://localhost:8080) для фронта

## Возможности
- Просмотр котиков с внешнего API
- Добавление/удаление котиков в избранное
- Адаптивный интерфейс
- Lazy loading котиков при скролле

---
