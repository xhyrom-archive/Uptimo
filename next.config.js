const { createSecureHeaders } = require("next-secure-headers");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/(.*)",
      headers: createSecureHeaders({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: "'self'",
            styleSrc: ["'self'", "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"],
          },
        },
        forceHTTPSRedirect: [true, { maxAge: 60 * 60 * 24 * 4, includeSubDomains: true }],
        referrerPolicy: "same-origin",
      }),
    }];
  }
}
