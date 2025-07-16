import NodeCache from 'node-cache';

// Create a new NodeCache instance with a standard TTL of 5 minutes.
// stdTTL: The standard time-to-live in seconds for every generated cache element.
// checkperiod: The period in seconds, as a number, used for the automatic delete check interval.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export default cache;
