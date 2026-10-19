-- Estructura de la base de datos

-- Tabla de usuarios
CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre_usuario TEXT NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles
CREATE TABLE roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL UNIQUE
);

-- Tabla de tipo_examen_medico
CREATE TABLE tipo_examen_medico (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL UNIQUE
);

-- Tabla de pacientes
CREATE TABLE pacientes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  -- Información personal
  rut TEXT NOT NULL UNIQUE,
  primer_nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  fecha_nacimiento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'O')),
  nacionalidad TEXT,
  estado_civil TEXT CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre')),
  -- Información de contacto
  email TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  contacto_emergencia_relacion TEXT,
  -- Información de previsión social
  tipo_prevision TEXT,
  tiene_convenio BOOLEAN DEFAULT FALSE,
  -- Información médica
  grupo_sanguineo TEXT,
  alergias TEXT,
  enfermedades_cronicas TEXT,
  discapacidades TEXT,
  observaciones_medicas_generales TEXT,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuario_roles (relación muchos a muchos)
CREATE TABLE usuario_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, rol_id)
);

-- Tabla de examen_medico
CREATE TABLE examen_medico (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tipo_examen_medico_id BIGINT NOT NULL REFERENCES tipo_examen_medico(id),
  paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  diagnosis TEXT,
  tratamiento TEXT,
  observaciones TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos_examen
CREATE TABLE documentos_examen (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  examen_medico_id BIGINT NOT NULL REFERENCES examen_medico(id) ON DELETE CASCADE,
  paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  documento BYTEA NOT NULL,
  nombre_archivo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de auditoria
CREATE TABLE auditoria (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_pacientes_rut ON pacientes(rut);
CREATE INDEX idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX idx_examen_medico_paciente_id ON examen_medico(paciente_id);
CREATE INDEX idx_documentos_examen_examen_id ON documentos_examen(examen_medico_id);
CREATE INDEX idx_documentos_examen_paciente_id ON documentos_examen(paciente_id);
CREATE INDEX idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha_hora ON auditoria(fecha_hora);

-- Insertar roles iniciales
INSERT INTO roles (nombre) VALUES ('admin'), ('medico'), ('paciente');

-- Insertar tipos de examen médico iniciales
INSERT INTO tipo_examen_medico (nombre) VALUES 
  ('Hemograma completo'),
  ('Perfil lipídico'),
  ('Glicemia'),
  ('Radiografía de tórax'),
  ('Electrocardiograma'),
  ('Ecografía abdominal'),
  ('Prueba de función hepática'),
  ('Prueba de función renal'),
  ('Análisis de orina'),
  ('Otro');
