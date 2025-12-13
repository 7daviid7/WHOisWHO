const { createClient } = require('redis');

async function testRedis(host, port) {
    const url = `redis://${host}:${port}`;
    console.log(`Testing connection to ${url}...`);
    const client = createClient({ url });

    client.on('error', (err) => console.log(`❌ Redis Error (${url}):`, err.message));

    try {
        await client.connect();
        console.log(`✅ Success: Connected to ${url}`);
        await client.set('test_key', 'hello');
        const val = await client.get('test_key');
        console.log(`   Written value: ${val}`);
        await client.disconnect();
    } catch (err) {
        console.log(`❌ Failed to connect/operate on ${url}:`, err.message);
    }
}

async function run() {
    await testRedis('localhost', 6379);
    await testRedis('127.0.0.1', 6379);
}

run();
