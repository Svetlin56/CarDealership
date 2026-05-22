ALTER TABLE inquiry
    ADD COLUMN admin_reply_message VARCHAR(2000) NULL,
    ADD COLUMN admin_replied_at TIMESTAMP NULL,
    ADD COLUMN admin_reply_read_by_user BOOLEAN NOT NULL DEFAULT FALSE;