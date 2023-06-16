import 'react-calendar/dist/Calendar.css';

import {
  Chat,
  ChatWindow,
  Launcher,
  Message,
  RuntimeAPIProvider,
  SessionStatus,
  SystemResponse,
  TurnType,
  UserResponse,
  useRuntime,
} from '@voiceflow/react-chat';
import { useState } from 'react';
import Calendar from 'react-calendar';
import { match } from 'ts-pattern';

const IMAGE = 'https://picsum.photos/seed/1/200/300';
const AVATAR = 'https://picsum.photos/seed/1/80/80';

enum CustomMessage {
  CALENDAR = 'custom_calendar',
  VIDEO = 'custom_video',
}

export const Demo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const runtime = useRuntime({
    verify: { authorization: import.meta.env.VF_DM_API_KEY },
    session: { userID: `anonymous-${Math.random()}` },
    traces: [
      {
        canHandle: ({ type }) => type === 'account_info',
        handle: ({ context }, trace) => {
          const { status, balance, created_at } = JSON.parse(trace.payload);

          context.messages.push({
            type: 'text',
            text: `You have a ${status} account with ${balance} in your balance. Your account was created on ${new Date(
              created_at
            ).toLocaleDateString()}`,
          });
          return context;
        },
      },
      {
        canHandle: ({ type }) => type === 'calendar',
        handle: ({ context }, trace) => {
          context.messages.push({ type: CustomMessage.CALENDAR, payload: JSON.parse(trace.payload) });
          return context;
        },
      },
      {
        canHandle: ({ type }) => type === 'video',
        handle: ({ context }, trace) => {
          context.messages.push({ type: CustomMessage.VIDEO, payload: trace.payload });
          return context;
        },
      },
    ],
  });

  const handleLaunch = async () => {
    setOpen(true);
    await runtime.launch();
  };

  const handleEnd = () => {
    runtime.setStatus(SessionStatus.ENDED);
    setOpen(false);
  };

  if (!open) {
    return (
      <span
        style={{
          position: 'absolute',
          right: '2rem',
          bottom: '2rem',
        }}
      >
        <Launcher onClick={handleLaunch} />
      </span>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: '1rem',
        top: '3rem',
        bottom: '3rem',
        width: '400px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflowX: 'hidden',
        overflowY: 'scroll',
      }}
    >
      <ChatWindow.Container>
        <RuntimeAPIProvider {...runtime}>
          <Chat
            title="My Assistant"
            description="welcome to my assistant"
            image={IMAGE}
            avatar={AVATAR}
            withWatermark
            startTime={runtime.session.startTime}
            hasEnded={runtime.isStatus(SessionStatus.ENDED)}
            isLoading={!runtime.session.turns.length}
            onStart={runtime.launch}
            onEnd={handleEnd}
            onSend={runtime.reply}
            onMinimize={handleEnd}
          >
            {runtime.session.turns.map((turn, turnIndex) =>
              match(turn)
                .with({ type: TurnType.USER }, ({ id, type: _, ...rest }) => <UserResponse {...rest} key={id} />)
                .with({ type: TurnType.SYSTEM }, ({ id, type: _, ...rest }) => (
                  <SystemResponse
                    {...rest}
                    key={id}
                    Message={({ message, ...props }) =>
                      match(message)
                        .with({ type: CustomMessage.CALENDAR }, ({ payload: { today } }) => (
                          <SystemResponse.SystemMessage {...props}>
                            <Message from="system">
                              <Calendar value={new Date(today)} />
                            </Message>
                          </SystemResponse.SystemMessage>
                        ))
                        .with({ type: CustomMessage.VIDEO }, ({ payload: url }) => (
                          <video controls style={{ paddingTop: 8, paddingBottom: 8 }}>
                            <source src={url} type="video/mp4" />
                            <track kind="captions" />
                          </video>
                        ))
                        .otherwise(() => <SystemResponse.SystemMessage {...props} message={message} />)
                    }
                    avatar={AVATAR}
                    isLast={turnIndex === runtime.session.turns.length - 1}
                  />
                ))
                .exhaustive()
            )}
            {runtime.indicator && <SystemResponse.Indicator avatar={AVATAR} />}
          </Chat>
        </RuntimeAPIProvider>
      </ChatWindow.Container>
    </div>
  );
};
