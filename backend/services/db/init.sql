CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
	id					SERIAL PRIMARY KEY,
	USERNAME			VARCHAR NOT NULL,
	EMAIL				CITEXT NOT NULL UNIQUE,
	H_PASSWORD			VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS objects (
	id                     SERIAL PRIMARY KEY,
	brand                VARCHAR(20) NOT NULL,
	owner_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
	type                VARCHAR(20) NOT NULL,
	description          VARCHAR(500),
	condition            VARCHAR(50),
	is_available         BOOLEAN DEFAULT true,
	created_at           TIMESTAMP DEFAULT NOW(),
	updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
	id					SERIAL PRIMARY KEY,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
	NAME				VARCHAR(50) NOT NULL
);

ALTER TABLE groups ADD CONSTRAINT groups_owner_name_unique UNIQUE (owner_id, name);

DO $$
BEGIN
	CREATE TYPE group_role AS ENUM ('admin', 'member');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS group_members (
	id			SERIAL PRIMARY KEY,
	group_id	INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	user_id		INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	role		group_role NOT NULL DEFAULT 'member',
	created_at	TIMESTAMP DEFAULT NOW(),
	CONSTRAINT	unique_membership UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_object_grants (
	id				SERIAL PRIMARY KEY,
	group_id		INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	object_id		INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
	granted_by		INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
	created_at		TIMESTAMP DEFAULT NOW(),
	CONSTRAINT		unique_group_object_grant UNIQUE (group_id, object_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id					SERIAL PRIMARY KEY,
	jti					UUID NOT NULL UNIQUE,
	user_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	revoked 		BOOLEAN NOT NULL DEFAULT false,
	expires_at	TIMESTAMP NOT NULL,
	created_at	TIMESTAMP NOT NULL DEFAULT NOW()
);