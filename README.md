**Deployed URL for testing**:

https://bitespeed-backend-04rw.onrender.com/identify (POST)

# Bitespeed Backend Task:

Identity Reconciliation

This project is a backend service designed to handle identity reconciliation based on incoming contact information. It consolidates contact information and ensures that new data is linked appropriately to existing records.

## Requirements

- Node.js
- PostgreSQL
- Prisma

## Setup

1. **Clone the repository:**

```bash
git clone https://github.com/akssingh0102/bitespeed-backend.git
cd bitespeed-backend
```

2. **Install dependencies:**

```bash
#Install node dependencies
npm install

#Build typescript to js
tsc -b

```

3. **Set up environment variables:**

Create a `.env` file in the root directory and add your database URL:

```env
DATABASE_URL=your-database-url
```

4. **Set up the database:**

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

5. **Start the application:**

```bash
npm start
```
