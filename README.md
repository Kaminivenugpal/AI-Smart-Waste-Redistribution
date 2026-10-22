# AI-Smart-Waste-Redistribution

## Receiver / NGO portal and donation coordination

Start the existing Vite frontend and Spring Boot backend, then open the frontend at
`http://localhost:5173`. Choose **Receiver / NGO Portal** in the top navigation to
register or sign in. Receiver accounts can browse available database donations,
filter by category or location, submit requests, follow request updates, and
coordinate pickup. Donors can manage incoming requests from their existing
dashboard.

The backend persists receiver accounts, donation requests, pickup status, and
receiver notifications in MySQL. With the existing Hibernate
`spring.jpa.hibernate.ddl-auto=update` configuration, the new tables are added
without dropping existing donor or item data. The matching MySQL definitions
are also included in [`database/schema.sql`](./database/schema.sql).