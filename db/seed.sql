-- Seed data for CivicTrack

-- 1. Insert Zones
INSERT INTO admin_zones (id, zone_name, department, city, city_code, official_handle) VALUES
('a1111111-1111-1111-1111-111111111111', 'Ward 12 (Civil Lines)', 'Public Works Department (PWD)', 'Jaipur', 'JPR', '@Jaipur_PWD_Official'),
('a2222222-2222-2222-2222-222222222222', 'Ward 15 (Malviya Nagar)', 'Solid Waste Management (SWM)', 'Jaipur', 'JPR', '@Jaipur_SWM_Zone'),
('a3333333-3333-3333-3333-333333333333', 'Ward 22 (Mansarovar)', 'Jaipur Vidyut Vitaran (JVVNL)', 'Jaipur', 'JPR', '@JVVNL_Mansarovar'),
('a4444444-4444-4444-4444-444444444444', 'Ward 8 (Vaishali Nagar)', 'Public Health Engineering (PHED)', 'Jaipur', 'JPR', '@PHED_JaipurWest'),
('a5555555-5555-5555-5555-555555555555', 'Ward 30 (Sanganer)', 'Municipal Drainage & Sewerage', 'Jaipur', 'JPR', '@Jaipur_Drainage');

-- 2. Insert Users
INSERT INTO users (id, name, phone, email, role) VALUES
('u1111111-1111-1111-1111-111111111111', 'Aarav Sharma', '+91 98290 12345', 'aarav.sharma@example.com', 'citizen'),
('u2222222-2222-2222-2222-222222222222', 'Priya Verma', '+91 98290 54321', 'priya.verma@example.com', 'citizen'),
('u3333333-3333-3333-3333-333333333333', 'Rajesh Meena', '+91 98290 98765', 'rajesh.meena@dept.gov.in', 'department_staff');

-- 3. Insert Public Budget Data with verifiable source_url
INSERT INTO zone_budget_public_data (id, zone_id, fiscal_year, allocated_amount, scheme_name, source_url) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '2025-26', 45000000.00, 'Smart City Urban Road Maintenance Scheme', 'https://jaipurmc.org/budget/2025-26/ward12-roads.pdf'),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '2025-26', 28000000.00, 'Swachh Bharat Urban Solid Waste Program', 'https://jaipurmc.org/budget/2025-26/swm-zone4.pdf'),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '2025-26', 15000000.00, 'Street Lighting Modernization & LED Overhaul', 'https://energy.rajasthan.gov.in/jvvnl/reports/ward22-led.pdf');
