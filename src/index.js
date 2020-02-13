import redis from 'redis';
import { promisify } from 'util';


class RedisAsync {
    constructor(host, port) {
        this.connected = false;
        this.host = host;
        this.port = port;
        this.connect();
    }

    connect() {
        this._alert('connecting', 'Redis connecting...');

        this.client = redis.createClient({
            host: this.host,
            port: this.port,

            retry_strategy: (options) => {
                this.connected = false;
                this._alert('Redis disconnected');
                this.client.quit();
            }
        });
        this.client.on('connect', () => {
            this.connected = true;
            this._alert('connect', 'Redis connected');
        });

        this.client.on('end', () => {
            this._alert('end', 'Redis end');
        });

        this.client.on('error', (err) => {
            this._alert('error', 'Redis Error' + err);
        });
    }

    async get(key) {
        if (this.connected) {

            console.log(`Redis GET ${key}`);

            const getAsync = promisify(this.client.get).bind(this.client);
            const data = await getAsync(key);
            return JSON.parse(data);
        } else {
            this.connect();
        }

        return null;
    }

    async ttl(key) {
        const ttlAsync = promisify(this.client.ttl).bind(this.client);
        return await ttlAsync(key);
    }

    async expire(key, time = 100000) {
        this.client.expire(key, time);
    }

    async set(key, data, time = 100000) {
        if (this.connected) {

            console.log(`Redis SET ${key}`);

            await this.client.set(key, JSON.stringify(data), 'EX', time);
        } else {
            this.connect();
        }
    }

    async scan(pattern, cursor = 0, count = 1000){
        const scanAsync = promisify(this.client.scan).bind(this.client);
        return await scanAsync(cursor, 'MATCH', pattern, 'COUNT', count);
    }

    async remove(key, exact) {

        if (this.connected) {

            if (exact) {
                console.log(`Redis REMOVE ${key}`);

                await this.client.del(key);
            } else {
                key = '*' + key + '*';

                const getAsync = promisify(this.client.keys).bind(this.client);
                const keys = await getAsync(key);

                if (keys.length > 0) {
                    console.log(`Redis REMOVE keys`, keys);
                    await this.client.del(keys);
                }
            }

        } else {
            this.connect();
        }
    }


    setAlertCallback(callback) {
        this.alertCallback = callback;
    }

    _alert(status, msg) {
        if (typeof this.alertCallback === 'function') {
            this.alertCallback(status, msg);
        } else {
            console.info(status, msg);
        }
    }
}

export default RedisAsync;