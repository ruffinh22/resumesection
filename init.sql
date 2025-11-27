-- Initialisation de la base de données resumesection_db

-- Créer les tables User, Report et WeeklyStats
-- (Elles seront créées par Flask SQLAlchemy au premier lancement)

-- Utilisateur test admin
INSERT INTO user (username, password_hash, role, section_name) VALUES 
('admin', 'scrypt:32768:8:1$hash_example$hash_value', 'admin', NULL);

-- Utilisateur test responsable de section
INSERT INTO user (username, password_hash, role, section_name) VALUES 
('section1', 'scrypt:32768:8:1$hash_example$hash_value', 'section_manager', 'Section 1');
