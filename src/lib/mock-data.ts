export interface Dork {
  id: string;
  query: string;
  description: string;
  category: "Sensitive Files" | "Vulnerable Servers" | "Log Files" | "Admin Panels" | "Tokens & Keys" | "SQL Injection" | "XSS" | "Backups" | "Index Of" | "Cloud Platforms" | "IoT & Surveillance" | "Network Infrastructure" | "Vulnerability Research" | "Cloud Leaks";
  platform: "google" | "bing" | "shodan" | "censys";
  successRate: number;
  author: string;
}

export const MOCK_DORKS: Dork[] = [
  // --- SENSITIVE FILES ---
  {
    id: "1",
    query: 'filetype:log "password"',
    description: "Search for log files containing plaintext passwords.",
    category: "Sensitive Files",
    platform: "google",
    successRate: 85,
    author: "ShadowOperator"
  },
  {
    id: "2",
    query: 'filetype:env "DB_PASSWORD"',
    description: "Find exposed environment configuration files leaking database credentials.",
    category: "Sensitive Files",
    platform: "google",
    successRate: 92,
    author: "GhostInTheShell"
  },
  {
    id: "3",
    query: 'filetype:sql "INSERT INTO" "password"',
    description: "Search for database backups containing credentials and user data.",
    category: "Backups",
    platform: "google",
    successRate: 78,
    author: "DataLeech"
  },

  // --- ADMIN PANELS ---
  {
    id: "4",
    query: 'inurl:admin/login.php',
    description: "Common path for administrative login portals and backends.",
    category: "Admin Panels",
    platform: "google",
    successRate: 95,
    author: "AdminHunter"
  },
  {
    id: "5",
    query: 'intitle:"Login" "Panel" "Unauthorized access is prohibited"',
    description: "Search for restricted corporate admin panels.",
    category: "Admin Panels",
    platform: "google",
    successRate: 88,
    author: "AccessDenied"
  },

  // --- VULNERABILITY RESEARCH ---
  {
    id: "6",
    query: 'inurl:/phpinfo.php',
    description: "Check for exposed PHP configuration and detailed server information.",
    category: "Vulnerability Research",
    platform: "google",
    successRate: 99,
    author: "BugBountyPro"
  },
  {
    id: "7",
    query: 'intitle:"Index of /" .git',
    description: "Exposed Git repositories revealing source code and development history.",
    category: "Vulnerability Research",
    platform: "google",
    successRate: 84,
    author: "GitScanner"
  },

  // --- CLOUD LEAKS ---
  {
    id: "8",
    query: 'site:s3.amazonaws.com "index of"',
    description: "Find public AWS S3 buckets with directory listing enabled.",
    category: "Cloud Leaks",
    platform: "google",
    successRate: 80,
    author: "CloudWatcher"
  },
  {
    id: "9",
    query: 'inurl:firebaseio.com/.json',
    description: "Publicly accessible Firebase real-time databases.",
    category: "Cloud Leaks",
    platform: "google",
    successRate: 88,
    author: "FirebaseFix"
  },

  // --- IOT & SURVEILLANCE ---
  {
    id: "10",
    query: 'intitle:"webcamXP 5"',
    description: "Find systems running webcamXP 5 surveillance software.",
    category: "IoT & Surveillance",
    platform: "google",
    successRate: 95,
    author: "EyeInTheSky"
  },

  // --- SHODAN / BING ---
  {
    id: "11",
    query: 'port:445 "Samba 3.0.20"',
    description: "Find systems vulnerable to SambaCry via Shodan port scanning.",
    category: "Network Infrastructure",
    platform: "shodan",
    successRate: 90,
    author: "PortScanner"
  },
  {
    id: "12",
    query: 'ip:204.152.190.1 filetype:pdf',
    description: "Identify PDF documents hosted on a specific IP subnet using Bing.",
    category: "Index Of",
    platform: "bing",
    successRate: 80,
    author: "BingSearcher"
  }
];
