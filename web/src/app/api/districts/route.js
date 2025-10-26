import sql from "@/app/api/utils/sql";

// Get all districts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || 'Chhattisgarh';
    
    const districts = await sql`
      SELECT id, name, state, district_code, latitude, longitude
      FROM districts 
      WHERE state = ${state}
      ORDER BY name ASC
    `;

    return Response.json({
      success: true,
      districts: districts
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

// Find district by location (GPS coordinates)
export async function POST(request) {
  try {
    const { latitude, longitude } = await request.json();
    
    if (!latitude || !longitude) {
      return Response.json(
        { success: false, error: 'Latitude and longitude required' },
        { status: 400 }
      );
    }

    // Find nearest district using distance calculation
    const nearestDistrict = await sql`
      SELECT 
        id, name, state, district_code,
        latitude, longitude,
        SQRT(
          POWER((latitude - ${latitude}), 2) + 
          POWER((longitude - ${longitude}), 2)
        ) as distance
      FROM districts 
      ORDER BY distance ASC
      LIMIT 1
    `;

    if (nearestDistrict.length === 0) {
      return Response.json(
        { success: false, error: 'No districts found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      district: nearestDistrict[0]
    });
  } catch (error) {
    console.error('Error finding district by location:', error);
    return Response.json(
      { success: false, error: 'Failed to find district' },
      { status: 500 }
    );
  }
}