import RedisAsync from './RedisAsync';
import {timeout} from '@azteam/ultilities';

class Provider {
    constructor(configs) {
        this.configs = configs;
        this.connections = {};
    }
    async getConnection(name) {
        if (!this.connections[name]) {
            const redis = new RedisAsync(this.configs[name]);

            while (!redis.connected) {
                await timeout(1000);
            }
            this.connections[name] = redis;
        }
        return this.connections[name];
    }

}

export default Provider;