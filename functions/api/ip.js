export async function onRequestGet(context) {

  const key = context.env.IPAPI_KEY;

  if (!key) {
    return Response.json(
      { error: "IPAPI_KEY not configured" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://api.ipapi.is/?key=${key}`,
    {
      headers: {
        "Accept": "application/json"
      }
    }
  );

  const data = await response.json();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public,max-age=300,s-maxage=300"
    }
  });
}
