// Simple test script to verify the discount API endpoints
// Run this with: node test-discount-api.js

const API_BASE = "https://scrubstore.runasp.net";

async function testDiscountAPI() {
  const sessionId = "test-session-123";
  const discountCode = "TEST10";

  console.log("Testing Discount API endpoints...\n");

  // Test Apply Discount
  try {
    console.log("1. Testing Apply Discount...");
    const applyUrl = new URL(`${API_BASE}/api/Cart/Discount`);
    applyUrl.searchParams.append('sessionid', sessionId);
    applyUrl.searchParams.append('discountcode', discountCode);

    const applyResponse = await fetch(applyUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Apply Discount Status: ${applyResponse.status}`);
    if (applyResponse.ok) {
      const applyData = await applyResponse.json();
      console.log("Apply Response:", JSON.stringify(applyData, null, 2));
    } else {
      console.log("Apply failed - this is expected for test data");
    }
  } catch (error) {
    console.log("Apply Error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test Delete Discount
  try {
    console.log("2. Testing Delete Discount...");
    const deleteUrl = new URL(`${API_BASE}/api/Cart/Discount`);
    deleteUrl.searchParams.append('sessionid', sessionId);

    const deleteResponse = await fetch(deleteUrl.toString(), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Delete Discount Status: ${deleteResponse.status}`);
    if (deleteResponse.ok) {
      console.log("Delete Response: Success");
    } else {
      const deleteData = await deleteResponse.json().catch(() => ({}));
      console.log("Delete Response:", JSON.stringify(deleteData, null, 2));
    }
  } catch (error) {
    console.log("Delete Error:", error.message);
  }

  console.log("\nAPI endpoint testing completed!");
}

testDiscountAPI();