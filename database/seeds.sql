
-- ==========================================================
-- FOUR SEAS INTERNATIONAL HOUSE S.A.C.
-- Initial catalog data
-- Database: four_seas_db
-- Currency: PEN (S/)
-- ==========================================================

-- 1. CATEGORIES
INSERT INTO categoria (nombre)
VALUES
    ('Chaufas, tallarines y combinados'),
    ('Platos de fondo')
ON CONFLICT (nombre) DO NOTHING;


-- 2. PRODUCTS
-- Category 1: Chaufas, tallarines y combinados

INSERT INTO producto (id_categoria, nombre, precio)
SELECT c.id_categoria, p.nombre, p.precio
FROM (
    VALUES
        ('Chaufa de Pollo', 15.00::NUMERIC(10,2)),
        ('Chaufa de Chancho', 15.00::NUMERIC(10,2)),
        ('Tallarín de Pollo', 18.00::NUMERIC(10,2)),
        ('Tallarín de Chancho', 18.00::NUMERIC(10,2)),
        ('Combinado de Pollo', 20.00::NUMERIC(10,2)),
        ('Aeropuerto de Pollo o Chancho', 20.00::NUMERIC(10,2)),
        ('Tallarín Taypa', 22.00::NUMERIC(10,2))
) AS p(nombre, precio)
JOIN categoria c
    ON c.nombre = 'Chaufas, tallarines y combinados'
WHERE NOT EXISTS (
    SELECT 1
    FROM producto existing
    WHERE existing.nombre = p.nombre
      AND existing.id_categoria = c.id_categoria
);


-- Category 2: Platos de fondo

INSERT INTO producto (id_categoria, nombre, precio)
SELECT c.id_categoria, p.nombre, p.precio
FROM (
    VALUES
        ('Pollo Chijaukay', 19.00::NUMERIC(10,2)),
        ('Pollo Tipakay', 19.00::NUMERIC(10,2)),
        ('Pollo enrollado con Espárragos', 19.00::NUMERIC(10,2)),
        ('Taypa', 22.00::NUMERIC(10,2)),
        ('Lomo Saltado', 19.00::NUMERIC(10,2)),
        ('Pollo con verdura', 19.00::NUMERIC(10,2)),
        ('Pollo con Fansi', 20.00::NUMERIC(10,2)),
        ('Kamlú Wantán', 22.00::NUMERIC(10,2)),
        ('Pollo con Tausi', 18.00::NUMERIC(10,2)),
        ('Pollo con Piña', 20.00::NUMERIC(10,2)),
        ('Tortilla con Pollo y verdura', 21.00::NUMERIC(10,2)),
        ('Chancho asado al Ajo', 22.00::NUMERIC(10,2)),
        ('Pollo con Frejolito', 18.00::NUMERIC(10,2)),
        ('Langostinos con verdura', 22.00::NUMERIC(10,2)),
        ('Chancho asado con Tamarindo', 18.00::NUMERIC(10,2)),
        ('Carne de Res con verdura', 19.00::NUMERIC(10,2)),
        ('Pescado con Tausi', 22.00::NUMERIC(10,2)),
        ('Chicharrón de Pollo', 22.00::NUMERIC(10,2)),
        ('Pollo Limonkay', 19.00::NUMERIC(10,2)),
        ('Guiso de Gaunam', 24.00::NUMERIC(10,2)),
        ('Vainita con Chancho molido', 22.00::NUMERIC(10,2)),
        ('Balsamina con Carne', 24.00::NUMERIC(10,2)),
        ('Mapo Taufú', 23.00::NUMERIC(10,2))
) AS p(nombre, precio)
JOIN categoria c
    ON c.nombre = 'Platos de fondo'
WHERE NOT EXISTS (
    SELECT 1
    FROM producto existing
    WHERE existing.nombre = p.nombre
      AND existing.id_categoria = c.id_categoria
);

-- ==========================================================
-- END OF INITIAL CATALOG DATA
-- ==========================================================
