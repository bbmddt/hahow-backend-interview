import NodeCache from 'node-cache';

// We use a standard TTL of 5 minutes (300 seconds) for cached data.
// This is a balanced choice to ensure data freshness without putting too much load on the external API.
// The `checkperiod` is set to 2 minutes to periodically clean up expired cache entries.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export default cache;