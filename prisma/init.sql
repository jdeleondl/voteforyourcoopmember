-- Crear tabla de miembros
CREATE TABLE IF NOT EXISTS Member (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cedula TEXT NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de asistencia
CREATE TABLE IF NOT EXISTS Attendance (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    confirmedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    emailSent INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (memberId) REFERENCES Member(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Crear tabla de candidatos
CREATE TABLE IF NOT EXISTS Candidate (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    council TEXT NOT NULL,
    bio TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de votos
CREATE TABLE IF NOT EXISTS Vote (
    id TEXT PRIMARY KEY,
    memberId TEXT NOT NULL,
    candidateId TEXT NOT NULL,
    position TEXT NOT NULL,
    votedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memberId) REFERENCES Member(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES Candidate(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS Vote_memberId_position_key ON Vote(memberId, position);
CREATE UNIQUE INDEX IF NOT EXISTS Member_email_key ON Member(email);
CREATE UNIQUE INDEX IF NOT EXISTS Member_cedula_key ON Member(cedula);
CREATE UNIQUE INDEX IF NOT EXISTS Attendance_memberId_key ON Attendance(memberId);
CREATE UNIQUE INDEX IF NOT EXISTS Attendance_code_key ON Attendance(code);

-- Insertar miembros de ejemplo
INSERT INTO Member (id, name, email, cedula) VALUES
('member-1', 'Juan Pérez', 'juan.perez@example.com', '001-1234567-8'),
('member-2', 'María González', 'maria.gonzalez@example.com', '001-2345678-9'),
('member-3', 'Pedro Rodríguez', 'pedro.rodriguez@example.com', '001-3456789-0'),
('member-4', 'Ana Martínez', 'ana.martinez@example.com', '001-4567890-1'),
('member-5', 'Carlos Sánchez', 'carlos.sanchez@example.com', '001-5678901-2'),
('member-6', 'Laura Fernández', 'laura.fernandez@example.com', '001-6789012-3'),
('member-7', 'Roberto López', 'roberto.lopez@example.com', '001-7890123-4'),
('member-8', 'Carmen Díaz', 'carmen.diaz@example.com', '001-8901234-5');

-- Insertar candidatos del Consejo de Administración
INSERT INTO Candidate (id, name, position, council) VALUES
('cand-admin-1', 'Luis Alberto Gómez', 'presidente', 'administracion'),
('cand-admin-2', 'Sandra Patricia Cruz', 'vicepresidente', 'administracion'),
('cand-admin-3', 'Miguel Ángel Torres', 'tesorero', 'administracion'),
('cand-admin-4', 'Patricia Isabel Ramírez', 'secretario', 'administracion'),
('cand-admin-5', 'Jorge Eduardo Morales', 'vocal', 'administracion'),
('cand-admin-6', 'Diana Carolina Vega', 'suplente1', 'administracion'),
('cand-admin-7', 'Fernando José Castillo', 'suplente2', 'administracion');

-- Insertar candidatos del Consejo de Vigilancia
INSERT INTO Candidate (id, name, position, council) VALUES
('cand-vigil-1', 'Ricardo Antonio Herrera', 'presidente', 'vigilancia'),
('cand-vigil-2', 'Gabriela María Ortiz', 'secretario', 'vigilancia'),
('cand-vigil-3', 'Andrés Felipe Rojas', 'vocal1', 'vigilancia'),
('cand-vigil-4', 'Claudia Marcela Jiménez', 'vocal2', 'vigilancia'),
('cand-vigil-5', 'Oscar David Mendoza', 'suplente1', 'vigilancia');

-- Insertar candidatos del Comité de Crédito
INSERT INTO Candidate (id, name, position, council) VALUES
('cand-credit-1', 'Alberto José Gutiérrez', 'presidente', 'credito'),
('cand-credit-2', 'Verónica Andrea Silva', 'secretario', 'credito'),
('cand-credit-3', 'Javier Alejandro Vargas', 'vocal', 'credito'),
('cand-credit-4', 'Mónica Beatriz Acosta', 'suplente1', 'credito');

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS Config (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
