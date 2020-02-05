
class YSError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class NotImplemented extends YSError {
    constructor() {
        super('Not implemented');
    }
}

module.exports = {
    YSError,
    NotImplemented,
};
