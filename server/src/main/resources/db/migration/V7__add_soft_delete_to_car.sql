ALTER TABLE car
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_car_deleted ON car (deleted);