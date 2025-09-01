-- Inicialización de la base de datos PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor

-- Crear la extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurar que el usuario tiene todos los permisos necesarios
GRANT ALL PRIVILEGES ON DATABASE cmpc TO cmpc123;
GRANT ALL PRIVILEGES ON SCHEMA public TO cmpc123;
GRANT CREATE ON SCHEMA public TO cmpc123;
GRANT USAGE ON SCHEMA public TO cmpc123;

-- Asegurar permisos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cmpc123;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cmpc123;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO cmpc123;

-- Hacer que el usuario sea propietario del esquema public
ALTER SCHEMA public OWNER TO cmpc123;
