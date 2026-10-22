CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Generalized Search Tree

CREATE TABLE IF NOT EXISTS users (
	id					SERIAL PRIMARY KEY,
	USERNAME			CITEXT NOT NULL UNIQUE,
	EMAIL				CITEXT NOT NULL UNIQUE,
	H_PASSWORD			VARCHAR(255) NOT NULL,
	updated_at			TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	deleted_at			TIMESTAMPTZ
);

DO $$
BEGIN
	CREATE TYPE object_condition AS ENUM ('new', 'good', 'worn');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
	CREATE TYPE object_type AS ENUM (
		'DIY',
		'Electronics',
		'Leisure',
		'Other'
	);
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS objects (
	id					SERIAL PRIMARY KEY,
	name				VARCHAR(30) NOT NULL,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type				object_type,
	description			VARCHAR(500),
	condition			object_condition NOT NULL,
	is_available		BOOLEAN NOT NULL DEFAULT true,
	created_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	updated_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	deleted_at			TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS groups (
	id					SERIAL PRIMARY KEY,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	NAME				VARCHAR(30) NOT NULL,
	description			VARCHAR(500),
	created_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	updated_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	deleted_at			TIMESTAMPTZ
);

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
	created_at	TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	updated_at	TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	CONSTRAINT	unique_membership UNIQUE (group_id, user_id)
);

DO $$
BEGIN
	CREATE TYPE post_status AS ENUM ('open', 'closed');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS posts (
	id					SERIAL PRIMARY KEY,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title				VARCHAR(60) NOT NULL,
	object_type			object_type,
	description			VARCHAR(500),
	status				post_status NOT NULL DEFAULT 'open',
	created_at			TIMESTAMPTZ DEFAULT NOW(),
	updated_at			TIMESTAMPTZ DEFAULT NOW(),
	deleted_at			TIMESTAMPTZ,
	from_date			TIMESTAMPTZ NOT NULL,
	to_date				TIMESTAMPTZ NOT NULL,
	CONSTRAINT			posts_date_order CHECK (to_date > from_date)
);

CREATE TABLE IF NOT EXISTS post_groups (
	id			SERIAL PRIMARY KEY,
	post_id		INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	group_id	INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	created_at	TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at	TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT	unique_post_group UNIQUE (post_id, group_id)
);

CREATE TABLE IF NOT EXISTS conversations (
	id				SERIAL PRIMARY KEY,
	post_id			INTEGER NOT NULL,
	created_at		TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at		TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
	id					SERIAL PRIMARY KEY,
	conversation_id		INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
	user_id				INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at			TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at			TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT			unique_conversation_member UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
	id					SERIAL PRIMARY KEY,
	conversation_id		INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
	content				TEXT NOT NULL,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at			TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at			TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id					SERIAL PRIMARY KEY,
	jti					UUID NOT NULL UNIQUE,
	user_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	revoked 		BOOLEAN NOT NULL DEFAULT false,
	expires_at	TIMESTAMPTZ NOT NULL,
	created_at	TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at	TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
	id					SERIAL PRIMARY KEY,
	user_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name				VARCHAR(50) NOT NULL,
	prefix			VARCHAR(16) NOT NULL,
	key_hash		VARCHAR(64) NOT NULL UNIQUE,
	last_used_at	TIMESTAMPTZ,
	revoked_at	TIMESTAMPTZ,
	created_at	TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
	CREATE TYPE lending_status as ENUM (
		'pending',
		'accepted',
		'active',
		'awaiting_confirmation',
		'returned',
		'rejected',
		'cancelled',
		'overdue'
	);
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS lending (
	id								SERIAL PRIMARY KEY,
	object_id						INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
	lender_id						INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	borrower_id						INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	post_id							INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	object_name						VARCHAR(30) NOT NULL,
	post_title						VARCHAR(60) NOT NULL,
	status							lending_status NOT NULL DEFAULT 'pending',
	lended_from						TIMESTAMPTZ NOT NULL,
	lended_to						TIMESTAMPTZ NOT NULL,
	message							VARCHAR(250),
	picked_up_at					TIMESTAMPTZ,
	borrower_returned_at			TIMESTAMPTZ,
	lender_confirmed_returned_at	TIMESTAMPTZ,
	created_at						TIMESTAMPTZ DEFAULT NOW(),
	updated_at						TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lending ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
	object_id WITH =, -- for same object
	tstzrange(lended_from, lended_to) WITH && -- if the two objects time range overlap 
) WHERE (status IN ('accepted', 'active', 'awaiting_confirmation', 'overdue')); -- only apply overlap check to these statuses
-- refuse to let two lending row exists if same object and same time range and statuses conflicts (like both accepted...)

ALTER TABLE lending ADD CONSTRAINT no_duplicate_pending
EXCLUDE USING gist (
	object_id WITH =,
	lender_id WITH =,
	borrower_id WITH =,
	tstzrange(lended_from, lended_to) WITH &&
) WHERE (status = 'pending');
