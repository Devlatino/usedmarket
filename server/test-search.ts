import { marketplaceService } from "./services/marketplaceService";

async function testSearch() {
  console.log("Testing search functionality...");
  
  try {
    // Perform a basic search with no filters
    const query = "lampada vintage";
    console.log(`\nSearching for: "${query}"`);
    
    const results = await marketplaceService.searchAllMarketplaces(query);
    
    console.log(`\nSearch complete! Found ${results.length} results.`);
    
    // Print the first 3 results
    if (results.length > 0) {
      console.log("\nSample results:");
      
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const result = results[i];
        console.log(`\n[${i+1}] ${result.title}`);
        console.log(`Marketplace: ${result.marketplace}`);
        console.log(`Price: ${result.price}`);
        console.log(`Condition: ${result.condition || 'Not specified'}`);
        console.log(`Location: ${result.location || 'Not specified'}`);
        console.log(`Listed: ${result.postedAt ? result.postedAt.toLocaleDateString() : 'Unknown'}`);
        console.log(`URL: ${result.listingUrl}`);
      }
    }
  } catch (error) {
    console.error("Error during search test:", error);
  }
}

// Run the test
testSearch();