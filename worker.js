// Cloudflare Worker Code
export default {
  async fetch(request, env, ctx) {
    // Constants and configurations
    const API_KEY = env.dll;
    const origin = request.headers.get("Origin");

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "x-dll,x-timestamp",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {

      // 2. Timestamp Validation
      const timestamp = parseInt(request.headers.get("x-timestamp"), 10);
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (!timestamp || Math.abs(currentTime - timestamp) > fiveMinutes) {
        return new Response("Request expired", { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // 3. Request ID Validation
      const expected_dll = request.headers.get("x-dll");
      if (!expected_dll || expected_dll != API_KEY) {
        return new Response("Invalid", { 
          status: 401,
          headers: corsHeaders 
        });
      }

      // If all validations pass, return Firebase config
      const firebaseConfig = {
        apiKey: env.apiKey,
        authDomain: env.authDomain,
        databaseURL: env.databaseURL,
        projectId: env.projectId,
        storageBucket: env.storageBucket,
        messagingSenderId: env.messagingSenderId,
        measurementId: env.measurementId,
      };

      return new Response(JSON.stringify(firebaseConfig));

    } catch (error) {
      return new Response("Internal Server Error", { 
        status: 500,
        headers: corsHeaders 
      });
    }
  }
};
