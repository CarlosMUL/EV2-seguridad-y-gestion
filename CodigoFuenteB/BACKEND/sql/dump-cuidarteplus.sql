--
-- PostgreSQL database dump
--
-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS cuidarteplus;

--
-- Name: cuidarteplus; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE cuidarteplus WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'Spanish_Spain.1252';

ALTER DATABASE cuidarteplus OWNER TO postgres;

\connect cuidarteplus

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;

ALTER SCHEMA public OWNER TO postgres;

COMMENT ON SCHEMA public IS 'standard public schema';

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    nombre_usuario text NOT NULL,
    contrasena text NOT NULL,
    correo text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    nombre text NOT NULL
);

ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: tipo_examen_medico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_examen_medico (
    id bigint NOT NULL,
    nombre text NOT NULL
);

ALTER TABLE public.tipo_examen_medico OWNER TO postgres;

--
-- Name: tipo_examen_medico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tipo_examen_medico ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tipo_examen_medico_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pacientes (
    id bigint NOT NULL,
    rut text NOT NULL,
    primer_nombre text NOT NULL,
    apellido_paterno text NOT NULL,
    apellido_materno text,
    fecha_nacimiento date NOT NULL,
    sexo text NOT NULL,
    nacionalidad text,
    estado_civil text,
    email text NOT NULL,
    telefono text,
    direccion text,
    contacto_emergencia_nombre text,
    contacto_emergencia_telefono text,
    contacto_emergencia_relacion text,
    tipo_prevision text,
    tiene_convenio boolean DEFAULT false,
    grupo_sanguineo text,
    alergias text,
    enfermedades_cronicas text,
    discapacidades text,
    observaciones_medicas_generales text,
    usuario_id bigint,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pacientes_sexo_check CHECK ((sexo = ANY (ARRAY['M'::text, 'F'::text, 'O'::text]))),
    CONSTRAINT pacientes_estado_civil_check CHECK ((estado_civil = ANY (ARRAY['soltero'::text, 'casado'::text, 'divorciado'::text, 'viudo'::text, 'union_libre'::text])))
);

ALTER TABLE public.pacientes OWNER TO postgres;

--
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.pacientes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pacientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: usuario_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_roles (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    rol_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.usuario_roles OWNER TO postgres;

--
-- Name: usuario_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuario_roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuario_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: examen_medico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.examen_medico (
    id bigint NOT NULL,
    tipo_examen_medico_id bigint NOT NULL,
    paciente_id bigint NOT NULL,
    diagnosis text,
    tratamiento text,
    observaciones text,
    notas text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.examen_medico OWNER TO postgres;

--
-- Name: examen_medico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.examen_medico ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.examen_medico_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: documentos_examen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documentos_examen (
    id bigint NOT NULL,
    examen_medico_id bigint NOT NULL,
    paciente_id bigint NOT NULL,
    documento bytea NOT NULL,
    nombre_archivo text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.documentos_examen OWNER TO postgres;

--
-- Name: documentos_examen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.documentos_examen ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.documentos_examen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id bigint NOT NULL,
    usuario_id bigint,
    accion text NOT NULL,
    fecha_hora timestamp with time zone DEFAULT now()
);

ALTER TABLE public.auditoria OWNER TO postgres;

--
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auditoria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (1, 'admin', 'admin', 'admin@cuidarteplus.com');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (2, 'medico', 'medico', 'medico@cuidarteplus.com');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (3, 'paciente', 'paciente', 'paciente@cuidarteplus.com');

--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (1, 'admin');
INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (2, 'medico');
INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (3, 'paciente');

INSERT INTO public.usuario_roles OVERRIDING SYSTEM VALUE VALUES (1, 1, 1);
INSERT INTO public.usuario_roles OVERRIDING SYSTEM VALUE VALUES (2, 2, 2);
INSERT INTO public.usuario_roles OVERRIDING SYSTEM VALUE VALUES (3, 3, 3);

INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (1, '11111111-1', 'Juan', 'Pérez', 'Gómez', '1985-03-14', 'M', 'Chilena', 'casado','paciente@cuidarteplus.com', '+56981234567', 'Av. Providencia 123','María Pérez', '+56999887766', 'Esposa','Fonasa', true, 'O+','Ninguna', 'Hipertensión', 'Ninguna','Control periódico de presión arterial', 3, '2025-12-17 08:10:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (2, '16789456-K', 'María', 'González', 'Rojas', '1990-07-22', 'F', 'Chilena', 'soltero','maria.gonzalez@gmail.com', '+56981112233', 'Los Leones 456','Carlos González', '+56990001122', 'Padre','Isapre', false, 'A+','Penicilina', 'Ninguna', 'Ninguna','Alergia medicamentosa registrada', NULL, '2025-12-17 08:12:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (3, '14235678-5', 'Pedro', 'Muñoz', 'Lagos', '1978-11-02', 'M', 'Chilena', 'divorciado','pedro.munoz@gmail.com', '+56982223344', 'Av. Grecia 890','Ana Lagos', '+56993334455', 'Hermana','Fonasa', true, 'B+','Ninguna', 'Diabetes tipo 2', 'Ninguna','Requiere control glicémico', NULL, '2025-12-17 08:15:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (4, '18934567-9', 'Camila', 'Silva', 'Torres', '1995-01-30', 'F', 'Chilena', 'soltero','camila.silva@gmail.com', '+56983334455', 'Ñuñoa 321','Jorge Silva', '+56994445566', 'Padre','Isapre', false, 'AB+','Polen', 'Asma', 'Ninguna','Uso ocasional de inhalador', NULL, '2025-12-17 08:17:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (5, '13124567-4', 'Andrés', 'Vargas', 'Mella', '1982-06-18', 'M', 'Chilena', 'casado','andres.vargas@gmail.com', '+56984445566', 'Macul 777','Laura Mella', '+56995556677', 'Esposa','Fonasa', true, 'A-','Mariscos', 'Ninguna', 'Ninguna','Evitar consumo de mariscos', NULL, '2025-12-17 08:20:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (6, '17456823-1', 'Valentina', 'Reyes', 'Contreras', '2000-09-09', 'F', 'Chilena', 'soltero','valentina.reyes@gmail.com', '+56985556677', 'La Florida 456','Patricia Contreras', '+56996667788', 'Madre','Fonasa', false, 'O-','Ninguna', 'Ninguna', 'Ninguna','Paciente sin antecedentes relevantes', NULL, '2025-12-17 08:22:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (7, '15897456-7', 'Ricardo', 'Navarro', 'Peña', '1970-04-01', 'M', 'Chilena', 'viudo','ricardo.navarro@gmail.com', '+56986667788', 'San Miguel 900','Felipe Navarro', '+56997778899', 'Hijo','Isapre', true, 'B-','Ninguna', 'Artrosis', 'Movilidad reducida','Dolor articular crónico', NULL, '2025-12-17 08:25:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (8, '19234567-3', 'Francisca', 'Araya', 'Fuentes', '1998-12-12', 'F', 'Chilena', 'union_libre','francisca.araya@gmail.com', '+56987778899', 'Independencia 234','Matías Fuentes', '+56998889900', 'Pareja','Fonasa', false, 'A+','Ninguna', 'Ninguna', 'Ninguna','Buen estado de salud general', NULL, '2025-12-17 08:27:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (9, '14567890-6', 'Diego', 'Carrasco', 'Morales', '1987-08-25', 'M', 'Chilena', 'casado','diego.carrasco@gmail.com', '+56988889900', 'Maipú 123','Paula Morales', '+56991112233', 'Esposa','Isapre', true, 'O+','Lácteos', 'Colon irritable', 'Ninguna','Dieta especial recomendada', NULL, '2025-12-17 08:30:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (10, '17654321-K', 'Daniela', 'Figueroa', 'Soto', '1992-02-14', 'F', 'Chilena', 'soltero','daniela.figueroa@gmail.com', '+56989990011', 'Recoleta 555','Luis Soto', '+56992223344', 'Padre','Fonasa', false, 'B+','Ninguna', 'Ninguna', 'Ninguna','Sin observaciones médicas', NULL, '2025-12-17 08:32:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (11, '16234578-8', 'Sebastián', 'Alarcón', 'Pinto', '1984-10-05', 'M', 'Chilena', 'casado','sebastian.alarcon@gmail.com', '+56981230001', 'Las Condes 101','Carolina Pinto', '+56990010001', 'Esposa','Isapre', true, 'AB-','Ninguna', 'Ninguna', 'Ninguna','Paciente sano', NULL, '2025-12-17 08:35:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (12, '19543218-4', 'Paula', 'Bustamante', 'Leiva', '1997-06-11', 'F', 'Chilena', 'soltero','paula.bustamante@gmail.com', '+56981230002', 'Puente Alto 222','Sonia Leiva', '+56990010002', 'Madre','Fonasa', false, 'O+','Ninguna', 'Anemia', 'Ninguna','Tratamiento con hierro', NULL, '2025-12-17 08:36:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (13, '14987654-3', 'Héctor', 'Campos', 'Salinas', '1975-01-20', 'M', 'Chilena', 'casado','hector.campos@gmail.com', '+56981230003', 'Renca 333','Patricio Campos', '+56990010003', 'Hermano','Fonasa', true, 'A+','Ninguna', 'Hipotiroidismo', 'Ninguna','Control endocrinológico anual', NULL, '2025-12-17 08:37:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (14, '17823456-7', 'Natalia', 'Delgado', 'Riquelme', '1993-09-03', 'F', 'Chilena', 'union_libre','natalia.delgado@gmail.com', '+56981230004', 'Quilicura 444','Diego Riquelme', '+56990010004', 'Pareja','Isapre', false, 'B+','Ninguna', 'Migraña', 'Ninguna','Cefaleas recurrentes', NULL, '2025-12-17 08:38:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (15, '13456789-0', 'Jorge', 'Espinoza', 'Herrera', '1968-12-28', 'M', 'Chilena', 'viudo','jorge.espinoza@gmail.com', '+56981230005', 'La Reina 555','María Herrera', '+56990010005', 'Hermana','Fonasa', true, 'O-','Ninguna', 'Cardiopatía', 'Ninguna','Seguimiento cardiológico', NULL, '2025-12-17 08:39:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (16, '18765432-6', 'Constanza', 'Farías', 'Olivares', '2001-04-17', 'F', 'Chilena', 'soltero','constanza.farias@gmail.com', '+56981230006', 'Peñalolén 666','Rodrigo Farías', '+56990010006', 'Padre','Fonasa', false, 'A+','Ninguna', 'Ninguna', 'Ninguna','Sin antecedentes mórbidos', NULL, '2025-12-17 08:40:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (17, '15678943-5', 'Marco', 'Godoy', 'Cifuentes', '1989-07-08', 'M', 'Chilena', 'divorciado','marco.godoy@gmail.com', '+56981230007', 'Estación Central 777','Daniela Cifuentes', '+56990010007', 'Ex esposa','Isapre', false, 'B-','Ninguna', 'Depresión', 'Ninguna','En tratamiento psicológico', NULL, '2025-12-17 08:41:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (18, '19876543-1', 'Javiera', 'Henríquez', 'Poblete', '1999-11-30', 'F', 'Chilena', 'soltero','javiera.henriquez@gmail.com', '+56981230008', 'San Joaquín 888','Andrea Poblete', '+56990010008', 'Madre','Fonasa', false, 'O+','Ninguna', 'Ninguna', 'Ninguna','Paciente joven sana', NULL, '2025-12-17 08:42:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (19, '14321987-9', 'Claudio', 'Ibarra', 'Vergara', '1980-05-19', 'M', 'Chilena', 'casado','claudio.ibarra@gmail.com', '+56981230009', 'Cerrillos 999','Verónica Vergara', '+56990010009', 'Esposa','Isapre', true, 'A-','Ninguna', 'Hipercolesterolemia', 'Ninguna','Dieta baja en grasas', NULL, '2025-12-17 08:43:00');
INSERT INTO public.pacientes OVERRIDING SYSTEM VALUE values (20, '17543219-2', 'Rocío', 'Jara', 'Méndez', '1994-03-26', 'F', 'Chilena', 'soltero','rocio.jara@gmail.com', '+56981230010', 'Vitacura 111','Fernando Jara', '+56990010010', 'Padre','Isapre', false, 'AB+','Ninguna', 'Ninguna', 'Ninguna','Buen estado general', NULL, '2025-12-17 08:44:00');

--
-- Data for Name: tipo_examen_medico; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (1, 'Hemograma completo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (2, 'Perfil lipídico');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (3, 'Glicemia');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (4, 'Glicemia en ayunas');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (5, 'Hemoglobina glicosilada (HbA1c)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (6, 'Curva de tolerancia a la glucosa');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (7, 'Radiografía de tórax');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (8, 'Radiografía de columna');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (9, 'Radiografía de extremidades');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (10, 'Radiografía de cráneo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (11, 'Electrocardiograma');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (12, 'Electrocardiograma de esfuerzo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (13, 'Holter de 24 horas');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (14, 'Ecografía abdominal');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (15, 'Ecografía pélvica');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (16, 'Ecografía obstétrica');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (17, 'Ecografía de tiroides');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (18, 'Ecografía de próstata');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (19, 'Ecografía de mama');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (20, 'Ecocardiograma');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (21, 'Ecocardiograma Doppler');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (22, 'Prueba de función hepática');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (23, 'Perfil hepático completo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (24, 'Bilirrubina total y fraccionada');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (25, 'Prueba de función renal');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (26, 'Urea y creatinina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (27, 'Depuración de creatinina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (28, 'Análisis de orina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (29, 'Urocultivo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (30, 'Análisis de heces');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (31, 'Coprocultivo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (32, 'Parasitológico');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (33, 'Sangre oculta en heces');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (34, 'Perfil tiroideo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (35, 'TSH');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (36, 'T3 y T4');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (37, 'Anticuerpos antitiroideos');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (38, 'Perfil hormonal');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (39, 'Testosterona');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (40, 'Estradiol');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (41, 'Progesterona');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (42, 'Prolactina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (43, 'Cortisol');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (44, 'Vitamina D');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (45, 'Vitamina B12');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (46, 'Ácido fólico');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (47, 'Ferritina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (48, 'Transferrina');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (49, 'Hierro sérico');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (50, 'Ácido úrico');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (51, 'Proteína C reactiva (PCR)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (52, 'Velocidad de sedimentación globular (VSG)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (53, 'Antígeno prostático específico (PSA)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (54, 'Mamografía');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (55, 'Densitometría ósea');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (56, 'Tomografía computarizada (TAC)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (57, 'TAC de cráneo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (58, 'TAC de tórax');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (59, 'TAC de abdomen');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (60, 'Resonancia magnética (RMN)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (61, 'RMN de cráneo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (62, 'RMN de columna');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (63, 'Endoscopia digestiva alta');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (64, 'Colonoscopia');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (65, 'Biopsia');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (66, 'Citología cervicovaginal (Papanicolaou)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (67, 'Frotis de garganta');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (68, 'Cultivo de esputo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (69, 'Espirometría');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (70, 'Prueba de alergias');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (71, 'Test de embarazo');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (72, 'Prueba de VIH');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (73, 'Hepatitis B');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (74, 'Hepatitis C');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (75, 'Sífilis (VDRL)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (76, 'Grupo sanguíneo y factor Rh');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (77, 'Coagulación');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (78, 'Tiempo de protrombina (TP)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (79, 'Tiempo de tromboplastina parcial (TTP)');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (80, 'INR');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (81, 'Marcadores tumorales');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (82, 'CEA');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (83, 'CA 19-9');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (84, 'CA 125');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (85, 'PSA libre');
INSERT INTO public.tipo_examen_medico OVERRIDING SYSTEM VALUE VALUES (86, 'Otro');

--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);

--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);

--
-- Name: tipo_examen_medico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_examen_medico_id_seq', 86, true);

--
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 20, true);

--
-- Name: usuario_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_roles_id_seq', 3, true);

--
-- Name: examen_medico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.examen_medico_id_seq', 1, true);

--
-- Name: documentos_examen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documentos_examen_id_seq', 1, true);

--
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 1, true);

--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

--
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);

--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);

--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);

--
-- Name: tipo_examen_medico tipo_examen_medico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_examen_medico
    ADD CONSTRAINT tipo_examen_medico_pkey PRIMARY KEY (id);

--
-- Name: tipo_examen_medico tipo_examen_medico_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_examen_medico
    ADD CONSTRAINT tipo_examen_medico_nombre_key UNIQUE (nombre);

--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);

--
-- Name: pacientes pacientes_rut_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_rut_key UNIQUE (rut);

--
-- Name: usuario_roles usuario_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_roles
    ADD CONSTRAINT usuario_roles_pkey PRIMARY KEY (id);

--
-- Name: usuario_roles usuario_roles_usuario_id_rol_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_roles
    ADD CONSTRAINT usuario_roles_usuario_id_rol_id_key UNIQUE (usuario_id, rol_id);

--
-- Name: examen_medico examen_medico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen_medico
    ADD CONSTRAINT examen_medico_pkey PRIMARY KEY (id);

--
-- Name: documentos_examen documentos_examen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_examen
    ADD CONSTRAINT documentos_examen_pkey PRIMARY KEY (id);

--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);

--
-- Name: pacientes pacientes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

--
-- Name: usuario_roles usuario_roles_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_roles
    ADD CONSTRAINT usuario_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE;

--
-- Name: usuario_roles usuario_roles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_roles
    ADD CONSTRAINT usuario_roles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

--
-- Name: examen_medico examen_medico_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen_medico
    ADD CONSTRAINT examen_medico_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;

--
-- Name: examen_medico examen_medico_tipo_examen_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examen_medico
    ADD CONSTRAINT examen_medico_tipo_examen_medico_id_fkey FOREIGN KEY (tipo_examen_medico_id) REFERENCES public.tipo_examen_medico(id);

--
-- Name: documentos_examen documentos_examen_examen_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_examen
    ADD CONSTRAINT documentos_examen_examen_medico_id_fkey FOREIGN KEY (examen_medico_id) REFERENCES public.examen_medico(id) ON DELETE CASCADE;

--
-- Name: documentos_examen documentos_examen_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_examen
    ADD CONSTRAINT documentos_examen_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;

--
-- Name: auditoria auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

--
-- Name: idx_pacientes_rut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pacientes_rut ON public.pacientes(rut);

--
-- Name: idx_pacientes_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pacientes_usuario_id ON public.pacientes(usuario_id);

--
-- Name: idx_examen_medico_paciente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_examen_medico_paciente_id ON public.examen_medico(paciente_id);

--
-- Name: idx_documentos_examen_examen_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documentos_examen_examen_id ON public.documentos_examen(examen_medico_id);

--
-- Name: idx_documentos_examen_paciente_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documentos_examen_paciente_id ON public.documentos_examen(paciente_id);

--
-- Name: idx_auditoria_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_usuario_id ON public.auditoria(usuario_id);

--
-- Name: idx_auditoria_fecha_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_fecha_hora ON public.auditoria(fecha_hora);

--
-- PostgreSQL database dump complete
--
