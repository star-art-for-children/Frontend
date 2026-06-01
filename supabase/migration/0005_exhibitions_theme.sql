ALTER TABLE exhibitions
ADD COLUMN theme text NOT NULL DEFAULT 'default'
CHECK (theme IN ('default', 'cherry', 'ocean', 'forest'));
