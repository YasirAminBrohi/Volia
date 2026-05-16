export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { cookies } = req.body;
  
  const RAILWAY_TOKEN = process.env.RAILWAY_API_TOKEN;
  const SERVICE_ID = process.env.RAILWAY_SERVICE_ID;
  const ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;
  const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;

  if (!RAILWAY_TOKEN || !SERVICE_ID || !ENVIRONMENT_ID || !PROJECT_ID) {
    return res.status(500).json({ error: 'Railway environment variables are missing on the server' });
  }

  try {
    // Step 1: Update COOKIES_JSON variable on Railway
    const mutation = `
      mutation {
        variableUpsert(input: {
          projectId: "${PROJECT_ID}"
          serviceId: "${SERVICE_ID}"
          environmentId: "${ENVIRONMENT_ID}"
          name: "COOKIES_JSON"
          value: ${JSON.stringify(JSON.stringify(cookies))}
        })
      }
    `;

    const upsertRes = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RAILWAY_TOKEN}`
      },
      body: JSON.stringify({ query: mutation })
    });
    
    const upsertData = await upsertRes.json();
    if (upsertData.errors) {
      throw new Error(upsertData.errors[0].message || 'Failed to update cookies variable');
    }

    // Step 2: Trigger redeploy
    const redeployMutation = `
      mutation {
        serviceInstanceRedeploy(
          serviceId: "${SERVICE_ID}"
          environmentId: "${ENVIRONMENT_ID}"
        )
      }
    `;

    const redeployRes = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RAILWAY_TOKEN}`
      },
      body: JSON.stringify({ query: redeployMutation })
    });

    const redeployData = await redeployRes.json();
    if (redeployData.errors) {
      throw new Error(redeployData.errors[0].message || 'Failed to trigger redeploy');
    }

    res.status(200).json({ success: true, message: 'Cookies updated. Cobalt is restarting...' });
  } catch (err) {
    console.error('API update error:', err);
    res.status(500).json({ error: err.message });
  }
}
