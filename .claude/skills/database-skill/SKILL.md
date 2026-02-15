---
name: database-skill
description: Create tables, migrations, and design database schemas safely. Use for PostgreSQL, Neon Serverless, or relational database tasks.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Plan table structures following normalization principles
   - Choose appropriate data types for each column
   - Define primary and foreign keys
   - Add indexes for frequently queried columns
   - Consider constraints (NOT NULL, UNIQUE, CHECK)

2. **Migrations**
   - Write reversible migrations (up and down scripts)
   - Use IF EXISTS / IF NOT EXISTS checks to prevent errors
   - Document changes clearly in migration files
   - Test migrations in a safe environment before production

3. **Table Creation**
   - Always validate table dependencies
   - Use descriptive names for tables and columns (snake_case)
   - Apply appropriate default values
   - Implement soft deletes when necessary

4. **Query Safety**
   - Use parameterized queries to prevent SQL injection
   - Wrap destructive operations in transactions
   - Review schema changes for impact on existing queries
   - Avoid large full-table scans when possible

---

## Best Practices

- Follow naming conventions consistently (tables: `snake_case`, indexes: `idx_`, foreign keys: `fk_`)  
- Avoid exposing database credentials in code; use environment variables  
- Implement row-level security or access control where appropriate  
- Optimize indexes and query plans for performance  
- Track migration history carefully  
- Test changes on development/staging before production  

---

## Example Structure

```sql
-- Create a user table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Add last_login column
ALTER TABLE users
ADD COLUMN last_login TIMESTAMP;

-- Example index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
