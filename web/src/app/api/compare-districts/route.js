import sql from "@/app/api/utils/sql";

// Compare districts performance
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const district1Id = searchParams.get('district1');
    const district2Id = searchParams.get('district2');
    
    if (!district1Id || !district2Id) {
      return Response.json(
        { success: false, error: 'Both district IDs required for comparison' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get current month data for both districts
    const comparisonData = await sql`
      SELECT 
        d.id,
        d.name as district_name,
        d.state,
        md.jobs_provided,
        md.wages_paid_percentage,
        md.pending_payments_crores,
        md.person_days,
        md.last_updated
      FROM districts d
      LEFT JOIN mgnrega_data md ON d.id = md.district_id 
        AND md.month = ${currentMonth} 
        AND md.year = ${currentYear}
      WHERE d.id IN (${district1Id}, ${district2Id})
      ORDER BY d.id
    `;

    if (comparisonData.length !== 2) {
      return Response.json(
        { success: false, error: 'District data not found' },
        { status: 404 }
      );
    }

    const [district1, district2] = comparisonData;

    // Get historical data for trends (last 6 months)
    const historicalData = await sql`
      SELECT 
        d.name as district_name,
        md.jobs_provided,
        md.wages_paid_percentage,
        md.pending_payments_crores,
        md.person_days,
        md.month,
        md.year
      FROM mgnrega_data md
      JOIN districts d ON md.district_id = d.id
      WHERE md.district_id IN (${district1Id}, ${district2Id})
      ORDER BY md.year DESC, md.month DESC, d.name
      LIMIT 12
    `;

    // Calculate performance comparisons
    const calculateComparison = (value1, value2, higherIsBetter = true) => {
      if (!value1 || !value2) return { percentage: 0, winner: 'tie' };
      
      const diff = ((value1 - value2) / value2) * 100;
      const percentage = Math.abs(diff);
      
      let winner;
      if (Math.abs(diff) < 1) {
        winner = 'tie';
      } else if (higherIsBetter) {
        winner = value1 > value2 ? 'district1' : 'district2';
      } else {
        winner = value1 < value2 ? 'district1' : 'district2';
      }
      
      return { percentage: percentage.toFixed(1), winner, difference: diff.toFixed(1) };
    };

    const jobsComparison = calculateComparison(
      district1.jobs_provided, 
      district2.jobs_provided, 
      true
    );
    
    const wagesComparison = calculateComparison(
      district1.wages_paid_percentage, 
      district2.wages_paid_percentage, 
      true
    );
    
    const pendingComparison = calculateComparison(
      district1.pending_payments_crores, 
      district2.pending_payments_crores, 
      false // Lower pending payments is better
    );
    
    const personDaysComparison = calculateComparison(
      district1.person_days, 
      district2.person_days, 
      true
    );

    // Generate insights
    const insights = [];
    
    if (jobsComparison.winner === 'district1') {
      insights.push(`${district1.district_name} has provided ${jobsComparison.percentage}% more jobs than ${district2.district_name}`);
    } else if (jobsComparison.winner === 'district2') {
      insights.push(`${district2.district_name} has provided ${jobsComparison.percentage}% more jobs than ${district1.district_name}`);
    }

    if (wagesComparison.winner === 'district1') {
      insights.push(`${district1.district_name} has better wage payment rate`);
    } else if (wagesComparison.winner === 'district2') {
      insights.push(`${district2.district_name} has better wage payment rate`);
    }

    if (pendingComparison.winner === 'district1') {
      insights.push(`${district1.district_name} has lower pending payments`);
    } else if (pendingComparison.winner === 'district2') {
      insights.push(`${district2.district_name} has lower pending payments`);
    }

    return Response.json({
      success: true,
      comparison: {
        district1: {
          id: district1.id,
          name: district1.district_name,
          state: district1.state,
          data: {
            jobs_provided: district1.jobs_provided || 0,
            wages_paid_percentage: district1.wages_paid_percentage || 0,
            pending_payments_crores: district1.pending_payments_crores || 0,
            person_days: district1.person_days || 0
          }
        },
        district2: {
          id: district2.id,
          name: district2.district_name,
          state: district2.state,
          data: {
            jobs_provided: district2.jobs_provided || 0,
            wages_paid_percentage: district2.wages_paid_percentage || 0,
            pending_payments_crores: district2.pending_payments_crores || 0,
            person_days: district2.person_days || 0
          }
        },
        comparisons: {
          jobs: jobsComparison,
          wages: wagesComparison,
          pending: pendingComparison,
          personDays: personDaysComparison
        },
        insights: insights,
        historicalData: historicalData
      }
    });
  } catch (error) {
    console.error('Error comparing districts:', error);
    return Response.json(
      { success: false, error: 'Failed to compare districts' },
      { status: 500 }
    );
  }
}