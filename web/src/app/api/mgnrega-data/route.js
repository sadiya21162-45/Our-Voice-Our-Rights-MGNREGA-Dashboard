import sql from "@/app/api/utils/sql";

// Get MGNREGA performance data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const months = searchParams.get('months') || '6'; // Default to 6 months
    
    if (!districtId) {
      return Response.json(
        { success: false, error: 'District ID required' },
        { status: 400 }
      );
    }

    // Get current data and historical trends
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get current month data
    const currentData = await sql`
      SELECT 
        md.jobs_provided,
        md.wages_paid_percentage,
        md.pending_payments_crores,
        md.person_days,
        md.month,
        md.year,
        md.last_updated,
        d.name as district_name,
        d.state
      FROM mgnrega_data md
      JOIN districts d ON md.district_id = d.id
      WHERE md.district_id = ${districtId} 
        AND md.month = ${currentMonth} 
        AND md.year = ${currentYear}
      LIMIT 1
    `;

    // Get historical data for trends
    const historicalData = await sql`
      SELECT 
        jobs_provided,
        wages_paid_percentage,
        pending_payments_crores,
        person_days,
        month,
        year
      FROM mgnrega_data
      WHERE district_id = ${districtId}
      ORDER BY year DESC, month DESC
      LIMIT ${parseInt(months)}
    `;

    // Calculate trends if we have previous month data
    let trends = {
      jobs: '0%',
      wages: '0%', 
      pending: '0%',
      personDays: '0%'
    };

    if (historicalData.length >= 2) {
      const current = historicalData[0];
      const previous = historicalData[1];
      
      if (current && previous) {
        const jobsChange = ((current.jobs_provided - previous.jobs_provided) / previous.jobs_provided * 100).toFixed(1);
        const wagesChange = ((current.wages_paid_percentage - previous.wages_paid_percentage) / previous.wages_paid_percentage * 100).toFixed(1);
        const pendingChange = ((current.pending_payments_crores - previous.pending_payments_crores) / previous.pending_payments_crores * 100).toFixed(1);
        const personDaysChange = ((current.person_days - previous.person_days) / previous.person_days * 100).toFixed(1);
        
        trends = {
          jobs: `${jobsChange > 0 ? '+' : ''}${jobsChange}%`,
          wages: `${wagesChange > 0 ? '+' : ''}${wagesChange}%`,
          pending: `${pendingChange > 0 ? '+' : ''}${pendingChange}%`,
          personDays: `${personDaysChange > 0 ? '+' : ''}${personDaysChange}%`
        };
      }
    }

    const result = {
      success: true,
      currentData: currentData[0] || null,
      historicalData: historicalData,
      trends: trends
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching MGNREGA data:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch MGNREGA data' },
      { status: 500 }
    );
  }
}

// Sync data from government API (would be called by cron job)
export async function POST(request) {
  try {
    const { districtId, data } = await request.json();
    
    if (!districtId || !data) {
      return Response.json(
        { success: false, error: 'District ID and data required' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Upsert MGNREGA data
    const result = await sql`
      INSERT INTO mgnrega_data (
        district_id, month, year, 
        jobs_provided, wages_paid_percentage, 
        pending_payments_crores, person_days
      ) VALUES (
        ${districtId}, ${month}, ${year},
        ${data.jobsProvided}, ${data.wagesPaidPercentage},
        ${data.pendingPaymentsCrores}, ${data.personDays}
      )
      ON CONFLICT (district_id, month, year)
      DO UPDATE SET
        jobs_provided = EXCLUDED.jobs_provided,
        wages_paid_percentage = EXCLUDED.wages_paid_percentage,
        pending_payments_crores = EXCLUDED.pending_payments_crores,
        person_days = EXCLUDED.person_days,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error syncing MGNREGA data:', error);
    return Response.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}