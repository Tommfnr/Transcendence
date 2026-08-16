CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Generalized Search Tree



CREATE TABLE IF NOT EXISTS users (
	id					SERIAL PRIMARY KEY,
	USERNAME			VARCHAR NOT NULL,
	EMAIL				CITEXT NOT NULL UNIQUE,
	H_PASSWORD			VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS objects (
	id                     SERIAL PRIMARY KEY,
	brand                VARCHAR(20) NOT NULL,
	owner_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type                VARCHAR(20) NOT NULL,
	description          VARCHAR(500),
	condition            VARCHAR(50),
	is_available         BOOLEAN DEFAULT true,
	created_at           TIMESTAMP DEFAULT NOW(),
	updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
	id					SERIAL PRIMARY KEY,
	NAME				VARCHAR(50) NOT NULL
);

ALTER TABLE groups ADD CONSTRAINT groups_name_unique UNIQUE (name);

CREATE TYPE role AS ENUM ('admin', 'member');

CREATE TABLE IF NOT EXISTS group_members (
	id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	role role NOT NULL DEFAULT 'member'
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id					SERIAL PRIMARY KEY,
	jti					UUID NOT NULL UNIQUE,
	user_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	revoked 		BOOLEAN NOT NULL DEFAULT false,
	expires_at	TIMESTAMP NOT NULL,
	created_at	TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE lending_status as ENUM (
	'created',
	'pending',
	'accepted',
	'active',
	'awating_confirmation',
	'returned',
	'disputed',
	'rejected',
	'cancelled',
	'overdue'
);

ALTER TABLE lending ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
	object_id WITH =, -- for same object
	tstzrange(lended_from, lended_to) WITH && -- if the two objects time range overlap 
) WHERE (status IN ('pending', 'accepted', 'active', 'awaiting_confirmation')); -- only apply overlap check to these statuses
-- refuse to let two lending row exists if same object and same time range and statuses conflicts (like both pending, both accepted...)


CREATE TABLE IF NOT EXISTS lending (
	id														SERIAL PRIMARY KEY,
	object_id											INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
	lender_id											INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	borrower_id										INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status												lending_status,
	lended_from										TIMESTAMPTZ,
	lended_to											TIMESTAMPTZ,
	picked_up_at									TIMESTAMPTZ,
	borrower_returned_at					TIMESTAMPTZ,
	lender_confirmed_returned_at	TIMESTAMPTZ,
	created_at										TIMESTAMPTZ,
	updated_at										TIMESTAMPTZ
)