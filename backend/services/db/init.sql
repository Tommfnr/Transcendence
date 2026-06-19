-- The table here is the same as defined in schema.ts in backend, but we are keeping this to ensure
-- correct db init before runtime

CREATE TABLE IF NOT EXISTS objects (
	id 					SERIAL PRIMARY KEY,
	brand				VARCHAR(20) NOT NULL,
	owner				VARCHAR(20) NOT NULL,
	type				VARCHAR(20) NOT NULL
);