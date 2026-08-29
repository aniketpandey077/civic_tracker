const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vjnsbpituwagvvmlvrum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing key. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const zones = [
  { id: 'b1111111-1111-1111-1111-111111111111', zone_name: 'Ward 18 (Model Town, Ludhiana)', department: 'Ludhiana Municipal Corporation — PWD', city: 'Ludhiana', city_code: 'LDH', official_handle: '@LMC_PWD_ModelTown' },
  { id: 'b2222222-2222-2222-2222-222222222222', zone_name: 'Ward 32 (Sahnewal, Ludhiana)', department: 'Ludhiana MC — Solid Waste Management', city: 'Ludhiana', city_code: 'LDH', official_handle: '@LMC_SWM_Sahnewal' },
  { id: 'b3333333-3333-3333-3333-333333333333', zone_name: 'Ward 9 (Civil Lines, Ludhiana)', department: 'Ludhiana MC — Roads & Drainage', city: 'Ludhiana', city_code: 'LDH', official_handle: '@LMC_Roads_CivilLines' },
  { id: 'b4444444-4444-4444-4444-444444444444', zone_name: 'Ward 45 (Dugri, Ludhiana)', department: 'Ludhiana MC — Public Health Engineering', city: 'Ludhiana', city_code: 'LDH', official_handle: '@LMC_PHE_Dugri' },
  { id: 'c1111111-1111-1111-1111-111111111111', zone_name: 'Ward 7 (Golden Avenue, Amritsar)', department: 'Amritsar Municipal Corporation — PWD', city: 'Amritsar', city_code: 'AMR', official_handle: '@AMC_PWD_GoldenAve' },
  { id: 'c2222222-2222-2222-2222-222222222222', zone_name: 'Ward 22 (Ranjit Avenue, Amritsar)', department: 'Amritsar MC — Solid Waste Management', city: 'Amritsar', city_code: 'AMR', official_handle: '@AMC_SWM_RanjitAve' },
  { id: 'c3333333-3333-3333-3333-333333333333', zone_name: 'Ward 14 (Old City Heritage, Amritsar)', department: 'Amritsar MC — Heritage Zone Roads', city: 'Amritsar', city_code: 'AMR', official_handle: '@AMC_Heritage_Roads' },
  { id: 'c4444444-4444-4444-4444-444444444444', zone_name: 'Ward 35 (Green Avenue, Amritsar)', department: 'Amritsar MC — Streetlights & Electrical', city: 'Amritsar', city_code: 'AMR', official_handle: '@AMC_Electrical_GreenAve' },
  { id: 'd1111111-1111-1111-1111-111111111111', zone_name: 'Sector 17 (City Centre, Chandigarh)', department: 'Chandigarh MC — Roads & Infrastructure', city: 'Chandigarh', city_code: 'CHD', official_handle: '@CMC_Roads_Sector17' },
  { id: 'd2222222-2222-2222-2222-222222222222', zone_name: 'Sector 22 (Industrial Area, Chandigarh)', department: 'Chandigarh MC — Sanitation & SWM', city: 'Chandigarh', city_code: 'CHD', official_handle: '@CMC_SWM_Sector22' },
  { id: 'd3333333-3333-3333-3333-333333333333', zone_name: 'Sector 35 (Residential, Chandigarh)', department: 'Chandigarh MC — Parks & Drainage', city: 'Chandigarh', city_code: 'CHD', official_handle: '@CMC_Parks_Sector35' },
  { id: 'd4444444-4444-4444-4444-444444444444', zone_name: 'Sector 9 (Chandigarh University Zone)', department: 'Chandigarh MC — Electrical & Streetlights', city: 'Chandigarh', city_code: 'CHD', official_handle: '@CMC_Electric_Sector9' },
  { id: 'e1111111-1111-1111-1111-111111111111', zone_name: 'Ward 8 (Urban Estate, Patiala)', department: 'Patiala Municipal Corporation — PWD', city: 'Patiala', city_code: 'PTL', official_handle: '@PMC_PWD_UrbanEstate' },
  { id: 'e2222222-2222-2222-2222-222222222222', zone_name: 'Ward 20 (Old City, Patiala)', department: 'Patiala MC — Solid Waste & Sanitation', city: 'Patiala', city_code: 'PTL', official_handle: '@PMC_SWM_OldCity' },
  { id: 'e3333333-3333-3333-3333-333333333333', zone_name: 'Ward 30 (Rajpura Road, Patiala)', department: 'Patiala MC — Roads & Drainage', city: 'Patiala', city_code: 'PTL', official_handle: '@PMC_Roads_Rajpura' },
  { id: 'f1111111-1111-1111-1111-111111111111', zone_name: 'Ward 11 (Model Town, Jalandhar)', department: 'Jalandhar Municipal Corporation — PWD', city: 'Jalandhar', city_code: 'JLD', official_handle: '@JMC_PWD_ModelTown' },
  { id: 'f2222222-2222-2222-2222-222222222222', zone_name: 'Ward 25 (New Model Town, Jalandhar)', department: 'Jalandhar MC — Solid Waste Management', city: 'Jalandhar', city_code: 'JLD', official_handle: '@JMC_SWM_NewModelTown' },
  { id: 'f3333333-3333-3333-3333-333333333333', zone_name: 'Ward 38 (Lajpat Nagar, Jalandhar)', department: 'Jalandhar MC — Roads & Infrastructure', city: 'Jalandhar', city_code: 'JLD', official_handle: '@JMC_Roads_LajpatNagar' },
  { id: 'f0111111-1111-1111-1111-111111111111', zone_name: 'Phase 7 (IT City, Mohali)', department: 'Greater Mohali Area Dev Authority (GMADA)', city: 'Mohali', city_code: 'MOH', official_handle: '@GMADA_Phase7' },
  { id: 'f0222222-2222-2222-2222-222222222222', zone_name: 'Phase 11 (Residential, Mohali)', department: 'GMADA — Roads & Drainage', city: 'Mohali', city_code: 'MOH', official_handle: '@GMADA_Phase11' }
];

async function seed() {
  const { data, error } = await supabase.from('admin_zones').upsert(zones, { onConflict: 'id' });
  if (error) {
    console.error('Seed Error:', error.message);
  } else {
    console.log('SUCCESS: All 20 Punjab zones successfully inserted into Supabase!');
  }
}

seed();
