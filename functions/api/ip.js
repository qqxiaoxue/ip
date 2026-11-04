const DATACENTER_ASNS = [
  13335, // Cloudflare
  16509, // AWS
  15169, // Google
  8075,  // Azure
  14061, // DigitalOcean
  63949, // Linode
  20473, // Vultr
  16276, // OVH
  24940  // Hetzner
];

function analyse(data) {

  let residential = 50;
  let datacenter = 0;
  let vpn = 0;
  let proxy = 0;
  let tor = 0;

  if (data.is_datacenter) {
    datacenter += 70;
    residential -= 30;
  }

  if (data.is_vpn) {
    vpn += 90;
    residential -= 20;
  }

  if (data.is_proxy) {
    proxy += 90;
    residential -= 20;
  }

  if (data.is_tor) {
    tor += 100;
    residential -= 50;
  }

  if (
    data.asn &&
    DATACENTER_ASNS.includes(Number(data.asn))
  ) {
    datacenter += 40;
    residential -= 20;
  }

  residential = Math.max(0, Math.min(100, residential));
  datacenter = Math.max(0, Math.min(100, datacenter));

  let type = "住宅网络";

  if (tor > 50) {
    type = "Tor 网络";
  } else if (vpn > 50) {
    type = "VPN 网络";
  } else if (proxy > 50) {
    type = "代理网络";
  } else if (datacenter > residential) {
    type = "数据中心";
  }

  const riskScore = Math.min(
    100,
    vpn * 0.4 +
    proxy * 0.2 +
    tor * 0.4 +
    datacenter * 0.1
  );

  return {
    type,
    confidence: Math.max(
      residential,
      datacenter
    ),
    residentialScore: residential,
    datacenterScore: datacenter,
    vpnScore: vpn,
    proxyScore: proxy,
    torScore: tor,
    riskScore: Math.round(riskScore)
  };
}

export async function onRequestGet(context) {

  const key = context.env.IPAPI_KEY;

  const response =
    await fetch(
      `https://api.ipapi.is/?key=${key}`
    );

  const data = await response.json();

  return Response.json({
    ...data,
    analysis: analyse(data)
  });
}
