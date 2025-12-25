# How to Get Agora App ID

1. Go to [Agora Console](https://console.agora.io/) and sign up/sign in.
2. In the Project Management tab, click "Create".
3. Name your project (e.g., "NSTU Mechatronics").
4. Choose "Testing Mode" (App ID only) for easier setup, or "Secure Mode" if you want to implement token server later.
5. Copy the **App ID**.
6. Open `.env.local` in your frontend folder.
7. Add: `NEXT_PUBLIC_AGORA_APP_ID=your_app_id_here`
8. Restart the server.
