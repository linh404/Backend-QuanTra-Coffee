CREATE TABLE ai_product_index (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    product_id BIGINT(20) NOT NULL UNIQUE,
    searchable_text LONGTEXT,
    extracted_tags JSON,
    summary TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE ai_user_profile (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL UNIQUE,
    favorite_category_id BIGINT(20) DEFAULT NULL,
    avg_order_value DECIMAL(12,2) DEFAULT 0,
    last_order_at DATETIME DEFAULT NULL,
    total_orders INT DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE ai_recommend_logs (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    product_id BIGINT(20) NOT NULL,
    source_type VARCHAR(50),
    reason_text TEXT,
    clicked TINYINT(1) DEFAULT 0,
    purchased TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_log_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ai_log_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_source (user_id, source_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE ai_chat_history (
    id BIGINT(20) NOT NULL AUTO_INCREMENT,
    session_id VARCHAR(255) NOT NULL,
    user_id BIGINT(20) NOT NULL,
    role VARCHAR(20) COMMENT 'user hoặc assistant',
    message_text TEXT,
    related_product_id BIGINT(20) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ai_chat_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ai_chat_product
        FOREIGN KEY (related_product_id) REFERENCES products(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_user_session (user_id, session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
