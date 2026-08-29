-- CivicTrack Migration 003 — Punjab Municipal Zone Seed Data
-- Run this AFTER 001_init_schema.sql and 002_rls_policies.sql
-- Covers: Ludhiana, Amritsar, Chandigarh, Patiala, Jalandhar, Mohali

INSERT INTO admin_zones (id, zone_name, department, city, city_code, boundary, official_handle) VALUES

-- ─── LUDHIANA ────────────────────────────────────────────────────────────────
(
  'b1111111-1111-1111-1111-111111111111',
  'Ward 18 (Model Town, Ludhiana)',
  'Ludhiana Municipal Corporation — PWD',
  'Ludhiana', 'LDH',
  ST_GeomFromText('POLYGON((75.820 30.910, 75.855 30.910, 75.855 30.935, 75.820 30.935, 75.820 30.910))', 4326),
  '@LMC_PWD_ModelTown'
),
(
  'b2222222-2222-2222-2222-222222222222',
  'Ward 32 (Sahnewal, Ludhiana)',
  'Ludhiana MC — Solid Waste Management',
  'Ludhiana', 'LDH',
  ST_GeomFromText('POLYGON((75.870 30.870, 75.905 30.870, 75.905 30.900, 75.870 30.900, 75.870 30.870))', 4326),
  '@LMC_SWM_Sahnewal'
),
(
  'b3333333-3333-3333-3333-333333333333',
  'Ward 9 (Civil Lines, Ludhiana)',
  'Ludhiana MC — Roads & Drainage',
  'Ludhiana', 'LDH',
  ST_GeomFromText('POLYGON((75.840 30.895, 75.870 30.895, 75.870 30.920, 75.840 30.920, 75.840 30.895))', 4326),
  '@LMC_Roads_CivilLines'
),
(
  'b4444444-4444-4444-4444-444444444444',
  'Ward 45 (Dugri, Ludhiana)',
  'Ludhiana MC — Public Health Engineering',
  'Ludhiana', 'LDH',
  ST_GeomFromText('POLYGON((75.800 30.865, 75.830 30.865, 75.830 30.895, 75.800 30.895, 75.800 30.865))', 4326),
  '@LMC_PHE_Dugri'
),

-- ─── AMRITSAR ─────────────────────────────────────────────────────────────────
(
  'c1111111-1111-1111-1111-111111111111',
  'Ward 7 (Golden Avenue, Amritsar)',
  'Amritsar Municipal Corporation — PWD',
  'Amritsar', 'AMR',
  ST_GeomFromText('POLYGON((74.820 31.610, 74.860 31.610, 74.860 31.640, 74.820 31.640, 74.820 31.610))', 4326),
  '@AMC_PWD_GoldenAve'
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Ward 22 (Ranjit Avenue, Amritsar)',
  'Amritsar MC — Solid Waste Management',
  'Amritsar', 'AMR',
  ST_GeomFromText('POLYGON((74.855 31.620, 74.895 31.620, 74.895 31.648, 74.855 31.648, 74.855 31.620))', 4326),
  '@AMC_SWM_RanjitAve'
),
(
  'c3333333-3333-3333-3333-333333333333',
  'Ward 14 (Old City (Heritage), Amritsar)',
  'Amritsar MC — Heritage Zone Roads',
  'Amritsar', 'AMR',
  ST_GeomFromText('POLYGON((74.870 31.618, 74.895 31.618, 74.895 31.638, 74.870 31.638, 74.870 31.618))', 4326),
  '@AMC_Heritage_Roads'
),
(
  'c4444444-4444-4444-4444-444444444444',
  'Ward 35 (Green Avenue, Amritsar)',
  'Amritsar MC — Streetlights & Electrical',
  'Amritsar', 'AMR',
  ST_GeomFromText('POLYGON((74.840 31.600, 74.870 31.600, 74.870 31.625, 74.840 31.625, 74.840 31.600))', 4326),
  '@AMC_Electrical_GreenAve'
),

-- ─── CHANDIGARH ───────────────────────────────────────────────────────────────
(
  'd1111111-1111-1111-1111-111111111111',
  'Sector 17 (City Centre, Chandigarh)',
  'Chandigarh MC — Roads & Infrastructure',
  'Chandigarh', 'CHD',
  ST_GeomFromText('POLYGON((76.770 30.730, 76.800 30.730, 76.800 30.755, 76.770 30.755, 76.770 30.730))', 4326),
  '@CMC_Roads_Sector17'
),
(
  'd2222222-2222-2222-2222-222222222222',
  'Sector 22 (Industrial Area, Chandigarh)',
  'Chandigarh MC — Sanitation & SWM',
  'Chandigarh', 'CHD',
  ST_GeomFromText('POLYGON((76.800 30.730, 76.830 30.730, 76.830 30.756, 76.800 30.756, 76.800 30.730))', 4326),
  '@CMC_SWM_Sector22'
),
(
  'd3333333-3333-3333-3333-333333333333',
  'Sector 35 (Residential, Chandigarh)',
  'Chandigarh MC — Parks & Drainage',
  'Chandigarh', 'CHD',
  ST_GeomFromText('POLYGON((76.762 30.704, 76.792 30.704, 76.792 30.730, 76.762 30.730, 76.762 30.704))', 4326),
  '@CMC_Parks_Sector35'
),
(
  'd4444444-4444-4444-4444-444444444444',
  'Sector 9 (Chandigarh University Zone)',
  'Chandigarh MC — Electrical & Streetlights',
  'Chandigarh', 'CHD',
  ST_GeomFromText('POLYGON((76.740 30.755, 76.770 30.755, 76.770 30.780, 76.740 30.780, 76.740 30.755))', 4326),
  '@CMC_Electric_Sector9'
),

-- ─── PATIALA ──────────────────────────────────────────────────────────────────
(
  'e1111111-1111-1111-1111-111111111111',
  'Ward 8 (Urban Estate, Patiala)',
  'Patiala Municipal Corporation — PWD',
  'Patiala', 'PTL',
  ST_GeomFromText('POLYGON((76.370 30.320, 76.410 30.320, 76.410 30.348, 76.370 30.348, 76.370 30.320))', 4326),
  '@PMC_PWD_UrbanEstate'
),
(
  'e2222222-2222-2222-2222-222222222222',
  'Ward 20 (Old City, Patiala)',
  'Patiala MC — Solid Waste & Sanitation',
  'Patiala', 'PTL',
  ST_GeomFromText('POLYGON((76.390 30.335, 76.425 30.335, 76.425 30.360, 76.390 30.360, 76.390 30.335))', 4326),
  '@PMC_SWM_OldCity'
),
(
  'e3333333-3333-3333-3333-333333333333',
  'Ward 30 (Rajpura Road, Patiala)',
  'Patiala MC — Roads & Drainage',
  'Patiala', 'PTL',
  ST_GeomFromText('POLYGON((76.410 30.340, 76.445 30.340, 76.445 30.368, 76.410 30.368, 76.410 30.340))', 4326),
  '@PMC_Roads_Rajpura'
),

-- ─── JALANDHAR ────────────────────────────────────────────────────────────────
(
  'f1111111-1111-1111-1111-111111111111',
  'Ward 11 (Model Town, Jalandhar)',
  'Jalandhar Municipal Corporation — PWD',
  'Jalandhar', 'JLD',
  ST_GeomFromText('POLYGON((75.550 31.305, 75.580 31.305, 75.580 31.330, 75.550 31.330, 75.550 31.305))', 4326),
  '@JMC_PWD_ModelTown'
),
(
  'f2222222-2222-2222-2222-222222222222',
  'Ward 25 (New Model Town, Jalandhar)',
  'Jalandhar MC — Solid Waste Management',
  'Jalandhar', 'JLD',
  ST_GeomFromText('POLYGON((75.575 31.318, 75.610 31.318, 75.610 31.345, 75.575 31.345, 75.575 31.318))', 4326),
  '@JMC_SWM_NewModelTown'
),
(
  'f3333333-3333-3333-3333-333333333333',
  'Ward 38 (Lajpat Nagar, Jalandhar)',
  'Jalandhar MC — Roads & Infrastructure',
  'Jalandhar', 'JLD',
  ST_GeomFromText('POLYGON((75.530 31.295, 75.560 31.295, 75.560 31.320, 75.530 31.320, 75.530 31.295))', 4326),
  '@JMC_Roads_LajpatNagar'
),

-- ─── MOHALI (SAS Nagar) ───────────────────────────────────────────────────────
(
  'g1111111-1111-1111-1111-111111111111',
  'Phase 7 (IT City, Mohali)',
  'Greater Mohali Area Dev Authority (GMADA)',
  'Mohali', 'MOH',
  ST_GeomFromText('POLYGON((76.720 30.700, 76.760 30.700, 76.760 30.730, 76.720 30.730, 76.720 30.700))', 4326),
  '@GMADA_Phase7'
),
(
  'g2222222-2222-2222-2222-222222222222',
  'Phase 11 (Residential, Mohali)',
  'GMADA — Roads & Drainage',
  'Mohali', 'MOH',
  ST_GeomFromText('POLYGON((76.755 30.705, 76.790 30.705, 76.790 30.732, 76.755 30.732, 76.755 30.705))', 4326),
  '@GMADA_Phase11'
);
