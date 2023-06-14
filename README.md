# demo-react-chat

## Install Dependencies

```sh
yarn install
```

## Import Example Project

Import this [project with custom actions](example_project.vf) into your Voiceflow workspace.
It includes custom `account_info`, `calendar` and `video` actions.

## Configure Environment

Follow [these instructions](https://developer.voiceflow.com/reference/project#obtaining-a-dialog-manager-api-key)
to get the Dialog API key for your Voiceflow project.

Write your API key to a `.env.local` file.

```sh
# replace `XXX` with your API key
echo 'VF_DM_API_KEY=XXX` > .env.local
```

## Run Dev Server

The demo app will be available locally at <http://127.0.0.1:3006>.

```sh
yarn dev
```

<img width="442" alt="Screenshot 2023-06-12 at 3 53 10 AM" src="https://github.com/voiceflow/demo-react-chat/assets/3784470/417199c3-317f-4722-9b5f-e27fff78d6e8">

## Invoke Custom Actions

### `account_info`

- "What is my account status?"
- "Can I check my account?"
- "What is the status of my account?"

This will re-use our existing text messages to display a message with the user's account information.
The `created_at` date is rendered with the locale-appropriate date format.

### `calendar`

- "Can I book an appointment?"
- "I want to schedule a meeting"

This will re-use our existing text messages to display a message with the user's account information.
The `created_at` date is rendered with the locale-appropriate date format.

### `video`

- "What services to you offer?"
- "Give me a list of services you provide"
- "What do you offer?"

This will re-use our existing text messages to display a message with the user's account information.
The `created_at` date is rendered with the locale-appropriate date format.
