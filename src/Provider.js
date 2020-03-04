import RedisAsync from './RedisAsync';

class Provider {
    constructor(configs) {
        this.configs = configs;
        this.connections = {};
    }
    getConnection(name) {
        if (!this.connections[name]) {
            this.connections[name] = new RedisAsync(this.configs[name]);
        }
        return this.connections[name];
    }

}

export default Provider;