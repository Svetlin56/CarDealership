CREATE TABLE inquiry_message (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 inquiry_id BIGINT NOT NULL,
                                 sender_type VARCHAR(20) NOT NULL,
                                 message VARCHAR(2000) NOT NULL,
                                 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 read_by_user BOOLEAN NOT NULL DEFAULT FALSE,
                                 read_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
                                 PRIMARY KEY (id),
                                 CONSTRAINT fk_inquiry_message_inquiry
                                     FOREIGN KEY (inquiry_id) REFERENCES inquiry(id)
                                         ON DELETE CASCADE
);

CREATE INDEX idx_inquiry_message_inquiry_created_at
    ON inquiry_message (inquiry_id, created_at);

CREATE INDEX idx_inquiry_message_user_unread
    ON inquiry_message (sender_type, read_by_user);

CREATE INDEX idx_inquiry_message_admin_unread
    ON inquiry_message (sender_type, read_by_admin);

INSERT INTO inquiry_message (
    inquiry_id,
    sender_type,
    message,
    created_at,
    read_by_user,
    read_by_admin
)
SELECT
    id,
    'USER',
    message,
    created_at,
    TRUE,
    TRUE
FROM inquiry
WHERE message IS NOT NULL
  AND TRIM(message) <> '';

INSERT INTO inquiry_message (
    inquiry_id,
    sender_type,
    message,
    created_at,
    read_by_user,
    read_by_admin
)
SELECT
    id,
    'ADMIN',
    admin_reply_message,
    COALESCE(admin_replied_at, CURRENT_TIMESTAMP),
    admin_reply_read_by_user,
    TRUE
FROM inquiry
WHERE admin_reply_message IS NOT NULL
  AND TRIM(admin_reply_message) <> '';