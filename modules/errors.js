module.exports = {
    NoDefinitionsFound: class NoDefinitionsFound extends Error {
        constructor (additionalInfo = {}) {
            super();

            this.name = 'NoDefinitionsFound';
            this.title = 'No Definitions Found';
            this.message = 'Sorry pal, we couldn\'t find definitions for the word you were looking for.';
            this.resolution = 'You can try the search again at later time or head to the web instead.';
            this.additionalInfo = additionalInfo;
            this.requestType = 'notFound';
        }
    },

    RateLimitError: class RateLimitError extends Error {
        constructor (additionalInfo = {}) {
            super();

            this.name = 'RateLimitError';
            this.title = 'API Rate Limit Exceeded';
            this.message = 'Sorry pal, you were just rate limited by the upstream server.';
            this.resolution = 'You can try the search again at later time or head to the web instead.';
            this.additionalInfo = additionalInfo;
            this.requestType = 'rateLimit';
        }
    },

    UnexpectedError: class UnexpectedError extends Error {
        constructor (additionalInfo = {}) {
            super();

            this.name = 'UnexpectedError';
            this.title = 'Something Went Wrong';
            this.message = 'Sorry pal, something went wrong, and it\s not your fault.';
            this.resolution = 'You can try the search again at later time or head to the web instead.';
            this.additionalInfo = additionalInfo;
            this.requestType = 'serverError';
        }
    },

    BadHTTPResponse: class BadHTTPResponse extends Error {
        constructor (additionalInfo = {}) {
            super();

            this.name = 'BadHTTPResponse';
            this.title = 'Upstream Server Failed';
            this.message = 'Sorry pal, upstream servers failed us.';
            this.resolution = 'You can try the search again at later time or head to the web instead.';
            this.additionalInfo = additionalInfo;
            this.requestType = 'serverError';
        }
    }
}