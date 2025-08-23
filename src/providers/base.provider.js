class BaseTranslationProvider {
    constructor(config = {}) {
        this.config = config;
        this.rateLimits = {
            requestsPerMinute: 60,
            charactersPerDay: 500000,
            requestsToday: 0,
            charactersToday: 0,
            lastReset: new Date().toDateString()
        };
    }

    async translate(text, targetLang = 'zh', sourceLang = 'auto') {
        throw new Error('translate() method must be implemented by subclass');
    }

    async detectLanguage(text) {
        throw new Error('detectLanguage() method must be implemented by subclass');
    }

    get name() {
        throw new Error('name getter must be implemented by subclass');
    }

    get limits() {
        return this.rateLimits;
    }

    isWithinLimits(textLength) {
        this._resetDailyCountersIfNeeded();
        
        return (
            this.rateLimits.charactersToday + textLength <= this.rateLimits.charactersPerDay &&
            this.rateLimits.requestsToday < (this.rateLimits.requestsPerMinute * 24 * 60)
        );
    }

    updateUsage(textLength) {
        this._resetDailyCountersIfNeeded();
        this.rateLimits.requestsToday++;
        this.rateLimits.charactersToday += textLength;
    }

    _resetDailyCountersIfNeeded() {
        const today = new Date().toDateString();
        if (this.rateLimits.lastReset !== today) {
            this.rateLimits.requestsToday = 0;
            this.rateLimits.charactersToday = 0;
            this.rateLimits.lastReset = today;
        }
    }

    async isHealthy() {
        try {
            await this.translate('test', 'en', 'en');
            return true;
        } catch (error) {
            console.error(`Health check failed for ${this.name}:`, error.message);
            return false;
        }
    }

    getQualityScore() {
        return 0.5;
    }

    getResponseTime() {
        return 1000;
    }
}

module.exports = BaseTranslationProvider;