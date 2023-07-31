```
CONFIG_NAME                     = ALL MODULES
PORT                            = 3000
MAX_BODY_SIZE                   = 2mb
MODULES_PATH                    = ./modules
MODULES                         = defaults, webauth, passport

# CONNECTION TO A GATEWAY
REMOTE_HOST                     = http://remotehost:8080
LOCAL_HOST                      = http://serverhost:3000
LIVE                            = true/false
REPLICA                         = true/false
PASSKEY                         = ---server-passkey---
AUTO_ATTACH_PASSKEY             = ---gateway-auto-attach-passkey---

# SET THIS SERVER AS A GATEWAY
SERVER_0_HOST                   = http://serverhost:3000
SERVER_0_NAME                   = My Module
SERVER_0_LIVE                   = true
SERVER_0_PASSKEY                = ---server-passkey---

# DEFAULTS_MODULE
STATIC_ROUTE                    = /static/defaults
STATIC_PATH                     = ./static


# AUTH_MODULE_WEBAUTH
WEBAUTH_ORIGIN                  = http://localhost:3000

# AUTH_MODULE_PASSPORT
ENCRYPTION_KEY                  = ---ENCRYPTION_KEY----
REDIRECT_URI_BASE               = http://localhost:3000
REDIRECT_URI_PATH               = /api/passport/response

GOOGLE_CLIENT_ID                = ----GOOGLE_CLIENT_ID----
GOOGLE_CLIENT_SECRET            = ----GOOGLE_CLIENT_SECRET----
GOOGLE_RESPONSE_TYPE            = code
GOOGLE_ACCESS_TYPE              = offline
GOOGLE_PROMPT                   = consent
GOOGLE_DEFAULT_SCOPES           = https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile

TWITTER_CLIENT_ID               = ----TWITTER_CLIENT_ID-----
TWITTER_RESPONSE_TYPE           = code
TWITTER_DEFAULT_SCOPES          = offline.access, users.read, tweet.read
TWITTER_USER.FIELDS             = id, name, profile_image_url, username
TWITTER_CODE_CHALLENGE          = nemo
TWITTER_CODE_CHALLENGE_METHOD   = plain

LIVE_CLIENT_ID                  = ----LIVE_CLIENT_ID----
LIVE_CLIENT_SECRET              = ----LIVE_CLIENT_SECRET----
LIVE_RESPONSE_TYPE              = code
LIVE_ACCESS_TYPE                = offline
LIVE_PROMPT                     = consent
LIVE_GRANT_TYPE                 = authorization_code
LIVE_DEFAULT_SCOPES             = openid, profile, email, User.Read
```

List all modules linked:
```bash
npm ls -g --depth=0 --link=true
```

To link nemo3 to a project:

```bash
sudo npm link nemo3
```
