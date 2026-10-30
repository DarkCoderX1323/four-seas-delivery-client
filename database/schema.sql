
-- ==========================================================
-- FOUR SEAS INTERNATIONAL HOUSE S.A.C.
-- Database: four_seas_db
-- PostgreSQL 18
-- Initial relational schema
-- ==========================================================

-- 1. CLIENTES
CREATE TABLE cliente (
    id_cliente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(250) NOT NULL,

    CONSTRAINT chk_cliente_nombre
        CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- 2. USUARIOS
CREATE TABLE usuario (
    id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    CONSTRAINT chk_usuario_nombre
        CHECK (LENGTH(TRIM(nombre_completo)) > 0),

    CONSTRAINT chk_usuario_rol
        CHECK (rol IN (
            'ADMINISTRADOR',
            'RECEPCION',
            'COCINA',
            'MOTORIZADO'
        ))
);

-- 3. CATEGORIAS
CREATE TABLE categoria (
    id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,

    CONSTRAINT chk_categoria_nombre
        CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- 4. PRODUCTOS
CREATE TABLE producto (
    id_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_producto_precio
        CHECK (precio >= 0),

    CONSTRAINT chk_producto_nombre
        CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- 5. ZONAS DE DELIVERY
CREATE TABLE zona_delivery (
    id_zona BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tarifa NUMERIC(10,2) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_zona_tarifa
        CHECK (tarifa >= 0),

    CONSTRAINT chk_zona_nombre
        CHECK (LENGTH(TRIM(nombre)) > 0)
);

-- 6. PEDIDOS
CREATE TABLE pedido (
    id_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    id_motorizado BIGINT,
    id_zona BIGINT NOT NULL,

    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',

    direccion_entrega VARCHAR(250) NOT NULL,
    costo_envio NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,

    metodo_pago VARCHAR(30) NOT NULL,

    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_motorizado
        FOREIGN KEY (id_motorizado)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_zona
        FOREIGN KEY (id_zona)
        REFERENCES zona_delivery(id_zona)
        ON DELETE RESTRICT,

    CONSTRAINT chk_pedido_estado
        CHECK (estado IN (
            'PENDIENTE',
            'EN_PREPARACION',
            'LISTO_PARA_ENTREGA',
            'EN_CAMINO',
            'ENTREGADO',
            'CANCELADO'
        )),

    CONSTRAINT chk_pedido_costo_envio
        CHECK (costo_envio >= 0),

    CONSTRAINT chk_pedido_total
        CHECK (total >= 0),

    CONSTRAINT chk_pedido_direccion
        CHECK (LENGTH(TRIM(direccion_entrega)) > 0),

    CONSTRAINT chk_pedido_metodo_pago
        CHECK (LENGTH(TRIM(metodo_pago)) > 0)
);

-- 7. DETALLES DEL PEDIDO
CREATE TABLE detalle_pedido (
    id_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,

    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    observaciones VARCHAR(250),

    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON DELETE RESTRICT,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON DELETE RESTRICT,

    CONSTRAINT chk_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_detalle_subtotal
        CHECK (
            subtotal = ROUND(cantidad * precio_unitario, 2)
        )
);

-- 8. COMPROBANTES INTERNOS
CREATE TABLE comprobante (
    id_comprobante BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido BIGINT NOT NULL UNIQUE,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_total NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_comprobante_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON DELETE RESTRICT,

    CONSTRAINT chk_comprobante_monto
        CHECK (monto_total >= 0)
);

-- 9. HISTORIAL DE ESTADOS DEL PEDIDO
CREATE TABLE pedido_estado_historial (
    id_historial BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,

    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historial_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON DELETE RESTRICT,

    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE RESTRICT,

    CONSTRAINT chk_historial_estado_nuevo
        CHECK (estado_nuevo IN (
            'PENDIENTE',
            'EN_PREPARACION',
            'LISTO_PARA_ENTREGA',
            'EN_CAMINO',
            'ENTREGADO',
            'CANCELADO'
        )),

    CONSTRAINT chk_historial_estado_anterior
        CHECK (
            estado_anterior IS NULL
            OR estado_anterior IN (
                'PENDIENTE',
                'EN_PREPARACION',
                'LISTO_PARA_ENTREGA',
                'EN_CAMINO',
                'ENTREGADO',
                'CANCELADO'
            )
        ),

    CONSTRAINT chk_historial_cambio
        CHECK (
            estado_anterior IS NULL
            OR estado_anterior <> estado_nuevo
        )
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_pedido_cliente
    ON pedido(id_cliente);

CREATE INDEX idx_pedido_usuario
    ON pedido(id_usuario);

CREATE INDEX idx_pedido_motorizado
    ON pedido(id_motorizado);

CREATE INDEX idx_pedido_zona
    ON pedido(id_zona);

CREATE INDEX idx_pedido_estado
    ON pedido(estado);

CREATE INDEX idx_pedido_fecha
    ON pedido(fecha_hora);

CREATE INDEX idx_detalle_pedido
    ON detalle_pedido(id_pedido);

CREATE INDEX idx_detalle_producto
    ON detalle_pedido(id_producto);

CREATE INDEX idx_historial_pedido_fecha
    ON pedido_estado_historial(id_pedido, fecha_hora);

CREATE INDEX idx_historial_usuario
    ON pedido_estado_historial(id_usuario);

-- ==========================================================
-- END OF INITIAL SCHEMA
-- ==========================================================
