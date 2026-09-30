import { insertTestData } from "@\/src/lib/test-db";

export async function GET() {
  try {
    const result = await insertTestData();

    return Response.json({
      message: "Test data inserted successfully",
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting test data:", error);

    return Response.json({
      message: "Failed to insert test data",
      success: false,
      status: 500,
    });
  }
}
