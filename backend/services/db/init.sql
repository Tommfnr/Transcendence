CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Generalized Search Tree

CREATE TABLE IF NOT EXISTS users (
	id					SERIAL PRIMARY KEY,
	USERNAME			VARCHAR NOT NULL UNIQUE,
	EMAIL				CITEXT NOT NULL UNIQUE,
	H_PASSWORD			VARCHAR(255) NOT NULL,
	updated_at			TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
		'Tools',
		'Electronics',
		'Vehicles',
		'Outdoor & Recreation',
		'Media',
		'Events',
		'Clothing & Gear'
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
	updated_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS object_group_grants (
	id					SERIAL PRIMARY KEY,
	object_id			INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
	group_id			INTEGER NOT NULL,
	granted_by			INTEGER NOT NULL,
	created_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	updated_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	CONSTRAINT			unique_object_group_grant UNIQUE (object_id, group_id)
);

CREATE TABLE IF NOT EXISTS groups (
	id					SERIAL PRIMARY KEY,
	owner_id			INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	NAME				VARCHAR(30) NOT NULL,
	description			VARCHAR(500),
	created_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL,
	updated_at			TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
	from_date			TIMESTAMPTZ NOT NULL,
	to_date				TIMESTAMPTZ NOT NULL,
	CONSTRAINT		posts_date_order CHECK (to_date >= from_date)
);

CREATE TABLE IF NOT EXISTS post_groups (
	id			SERIAL PRIMARY KEY,
	post_id		INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	group_id	INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
	updated_at	TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT	unique_post_group UNIQUE (post_id, group_id)
);

CREATE TABLE IF NOT EXISTS conversations (
	id				SERIAL PRIMARY KEY,
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

DO $$
BEGIN
	CREATE TYPE lending_status as ENUM (
		'created',
		'pending',
		'accepted',
		'active',
		'awaiting_confirmation',
		'returned',
		'disputed',
		'rejected',
		'cancelled',
		'overdue'
	);
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS lending (
	id														SERIAL PRIMARY KEY,
	object_id											INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
	lender_id											INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	borrower_id										INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status												lending_status NOT NULL DEFAULT 'created',
	lended_from										TIMESTAMPTZ NOT NULL,
	lended_to											TIMESTAMPTZ NOT NULL,
	picked_up_at									TIMESTAMPTZ,
	borrower_returned_at					TIMESTAMPTZ,
	lender_confirmed_returned_at	TIMESTAMPTZ,
	created_at										TIMESTAMPTZ DEFAULT NOW(),
	updated_at										TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lending ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
	object_id WITH =, -- for same object
	tstzrange(lended_from, lended_to) WITH && -- if the two objects time range overlap 
) WHERE (status IN ('pending', 'accepted', 'active', 'awaiting_confirmation', 'overdue')); -- only apply overlap check to these statuses
-- refuse to let two lending row exists if same object and same time range and statuses conflicts (like both pending, both accepted...)
