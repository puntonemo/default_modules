```
CONFIG_NAME                     = "ALL MODULES"
PORT                            = 3000
MAX_BODY_SIZE                   = "50mb"
MODULES_PATH                    = "./modules"
MODULES                         = "defaults, webauth, passport"

# DEFAULTS_MODULE
STATIC_ROUTE                    = "/static/defaults"
STATIC_PATH                     = "./static"


# AUTH_MODULE_WEBAUTH
WEBAUTH_ORIGIN                  = http://localhost:3000

# AUTH_MODULE_PASSPORT
ENCRYPTION_KEY                  = "FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs="
REDIRECT_URI_BASE               = http://localhost:3000
REDIRECT_URI_PATH               = "/api/passport/response"

GOOGLE_CLIENT_ID                = "220119208739-8stfftjlnrk3j6o7g1p26svaccr3hv6j.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET            = "yoJo4VWNXURqad1zR6OxWCiE"
GOOGLE_RESPONSE_TYPE            = "code"
GOOGLE_ACCESS_TYPE              = "offline"
GOOGLE_PROMPT                   = "consent"
GOOGLE_DEFAULT_SCOPES           = https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile

TWITTER_CLIENT_ID               = "R3JRS29JMUhCbWdCaUJGdkNoUnI6MTpjaQ"
TWITTER_RESPONSE_TYPE           = "code"
TWITTER_DEFAULT_SCOPES          = offline.access, users.read, tweet.read
TWITTER_USER.FIELDS             = id, name, profile_image_url, username
TWITTER_CODE_CHALLENGE          = "nemo"
TWITTER_CODE_CHALLENGE_METHOD   = "plain"

LIVE_CLIENT_ID                  = "a754ab98-f017-4dee-908d-279567a114c2"
LIVE_CLIENT_SECRET              = "DHa8Q~zJGmjdCfIqNhHxBAbchJfeNlwECNQRccwQ"
LIVE_RESPONSE_TYPE              = "code"
LIVE_ACCESS_TYPE                = "offline"
LIVE_PROMPT                     = "consent"
LIVE_GRANT_TYPE                 = "authorization_code"
LIVE_DEFAULT_SCOPES             =  [ "openid", "profile", "email", "User.Read" ]
```

List all modules linked:
```bash
npm ls -g --depth=0 --link=true
```

To link nemo3 to a project:

```bash
sudo npm link nemo3
```
