# Webex RoomOS Portal

This application was created as a mechanism of managing Cisco Webex Cloud registered RoomOS Devices. 

Currently, it provides a simple portal with the following remote capabilities
- Listing of all Organisation Devices
- Device Status
- Initial/End Call 
- Remote Camera 1 PTZ Control

**NOTE** You must be a Device Admin in your Webex Org for this to work.

## Deployment

1. Register an Integration at [Webex Developers](https://developer.webex.com/my-apps) for your Organisation
2. Build and Deploy Docker Container (or deploy to Cloud)

Node command to create a secret - `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`

```
> docker build --tag roomos-portal .
> docker create --name roomos-portal -p xxxxx:3000 \
  -e CLIENT_ID=client-id-from-developer-dot-webex-dot-com \
  -e CLIENT_SECRET=client-secret-from-developer-dot-webex-dot-com \
  -e PUBLIC_URL=https-url-here-without-trailing-slash \
  -e SESSION_SECRET=please-change-me-to-a-session-secret \
  -e STATE_SECRET=please-change-me-to-a-state-secret
  -e PORT=3000 roomos-portal
```

3. Configure HTTPS Reverse Proxy or Direct Internet Connectivity for Public URL
4. Connect to Public URL to access portal

## Support

In case you've found a bug, please [open an issue on GitHub](../../issues).

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Cisco Webex,
or any of its subsidiaries or its affiliates. The official Cisco Webex website can be found at https://www.webex.com
