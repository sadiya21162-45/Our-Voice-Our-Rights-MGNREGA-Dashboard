import sql from "@/app/api/utils/sql";

// Submit issue report
export async function POST(request) {
  try {
    const {
      districtId,
      issueType,
      description,
      voiceNoteUrl,
      contactNumber
    } = await request.json();

    if (!districtId || !issueType) {
      return Response.json(
        { success: false, error: 'District ID and issue type required' },
        { status: 400 }
      );
    }

    // Validate issue type
    const validIssueTypes = ['wage_delay', 'work_quality', 'corruption', 'other'];
    if (!validIssueTypes.includes(issueType)) {
      return Response.json(
        { success: false, error: 'Invalid issue type' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO issue_reports (
        district_id, issue_type, description, 
        voice_note_url, contact_number
      ) VALUES (
        ${districtId}, ${issueType}, ${description || null},
        ${voiceNoteUrl || null}, ${contactNumber || null}
      )
      RETURNING id, created_at
    `;

    return Response.json({
      success: true,
      reportId: result[0].id,
      submittedAt: result[0].created_at,
      message: 'Issue reported successfully. Your report will be reviewed by authorities.'
    });
  } catch (error) {
    console.error('Error submitting issue report:', error);
    return Response.json(
      { success: false, error: 'Failed to submit issue report' },
      { status: 500 }
    );
  }
}

// Get issue reports (for admin dashboard)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const status = searchParams.get('status') || 'pending';
    const limit = searchParams.get('limit') || '50';

    let query = sql`
      SELECT 
        ir.id,
        ir.issue_type,
        ir.description,
        ir.contact_number,
        ir.status,
        ir.created_at,
        d.name as district_name,
        d.state
      FROM issue_reports ir
      JOIN districts d ON ir.district_id = d.id
      WHERE ir.status = ${status}
    `;

    if (districtId) {
      query = sql`
        SELECT 
          ir.id,
          ir.issue_type,
          ir.description,
          ir.contact_number,
          ir.status,
          ir.created_at,
          d.name as district_name,
          d.state
        FROM issue_reports ir
        JOIN districts d ON ir.district_id = d.id
        WHERE ir.district_id = ${districtId} AND ir.status = ${status}
        ORDER BY ir.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    } else {
      query = sql`
        SELECT 
          ir.id,
          ir.issue_type,
          ir.description,
          ir.contact_number,
          ir.status,
          ir.created_at,
          d.name as district_name,
          d.state
        FROM issue_reports ir
        JOIN districts d ON ir.district_id = d.id
        WHERE ir.status = ${status}
        ORDER BY ir.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
    }

    const reports = await query;

    return Response.json({
      success: true,
      reports: reports
    });
  } catch (error) {
    console.error('Error fetching issue reports:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}