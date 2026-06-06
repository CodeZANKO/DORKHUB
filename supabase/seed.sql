-- Seed Categories
INSERT INTO public.categories (id, name, slug, description) VALUES
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'Sensitive Files', 'sensitive-files', 'Configuration files, logs, and backups containing sensitive data.'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a2', 'Admin Panels', 'admin-panels', 'Login interfaces for administrative backends and control panels.'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a3', 'Vulnerability Research', 'vulnerability-research', 'Queries designed to find specific software vulnerabilities and CVEs.'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a4', 'Cloud Leaks', 'cloud-leaks', 'Exposed S3 buckets, Azure blobs, and cloud storage signatures.'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a5', 'IoT & Surveillance', 'iot-surveillance', 'Exposed IP cameras, smart devices, and industrial controllers.'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a6', 'Network Infrastructure', 'network-infrastructure', 'Internal network documentation, topologies, and device configs.')
ON CONFLICT (slug) DO NOTHING;

-- Seed Dorks
INSERT INTO public.dorks (category_id, query, description, platform, success_rate, status) VALUES
-- Sensitive Files
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'filetype:log "password"', 'Search for log files containing plaintext passwords.', 'google', 85, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'filetype:env "DB_PASSWORD"', 'Find exposed environment configuration files.', 'google', 92, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'filetype:sql "INSERT INTO" "password"', 'Search for database backups containing credentials.', 'google', 78, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'intitle:"index of" "config.php"', 'Directory listing with access to PHP configuration.', 'google', 65, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'filetype:xls "username" "password"', 'Excel sheets containing credentials.', 'google', 70, 'approved'),

-- Admin Panels
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a2', 'inurl:admin/login.php', 'Common path for administrative login portals.', 'google', 95, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a2', 'intitle:"Login" "Panel" "Unauthorized access is prohibited"', 'Search for restricted admin panels.', 'google', 88, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a2', 'inurl:Dashboard.jsp', 'Java-based administrative dashboards.', 'google', 82, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a2', 'intitle:"Control Panel" "Username"', 'General search for control panels.', 'google', 90, 'approved'),

-- Vulnerability Research
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a3', 'inurl:/phpinfo.php', 'Check for exposed PHP configuration and server info.', 'google', 99, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a3', 'intitle:"Index of /" .git', 'Exposed Git repositories (source code leak).', 'google', 84, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a3', 'inurl:"wp-content/plugins/wp-file-manager/"', 'Searching for sites with vulnerable WP File Manager plugin.', 'google', 75, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a3', 'site:*/server-status', 'Apache server status page (reveals active requests).', 'google', 60, 'approved'),

-- Cloud Leaks
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a4', 'site:s3.amazonaws.com "index of"', 'Find public AWS S3 buckets with directory listing.', 'google', 80, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a4', 'site:blob.core.windows.net "confidential"', 'Search for confidential files in Azure Blob Storage.', 'google', 72, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a4', 'inurl:firebaseio.com/.json', 'Publicly accessible Firebase databases.', 'google', 88, 'approved'),

-- IoT & Surveillance
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a5', 'intitle:"webcamXP 5"', 'Find systems running webcamXP 5 surveillance software.', 'google', 95, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a5', 'intitle:"Toshiba Network Camera" user', 'Toshiba IP cameras with login required.', 'google', 92, 'approved'),
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a5', 'inurl:system_device_info.php', 'Industrial control systems device info.', 'google', 68, 'approved'),

-- Shodan Subjects
(NULL, 'port:445 "Samba 3.0.20"', 'Find systems vulnerable to SambaCry.', 'shodan', 90, 'approved'),
(NULL, 'product:"Elasticsearch" status:200', 'Unprotected Elasticsearch instances.', 'shodan', 85, 'approved'),
(NULL, 'title:"Hacked by"', 'Identify compromised network nodes.', 'shodan', 75, 'approved'),

-- Bing Specific
('8b7e2894-3e74-4f51-9e7b-c9c0c8f5a1a1', 'ip:204.152.190.1 filetype:pdf', 'Find PDFs on a specific IP address using Bing.', 'bing', 80, 'approved');
