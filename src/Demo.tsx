import { Chat, ChatWindow, Launcher, SessionStatus, SystemResponse, TurnType, UserResponse, useRuntime } from '@voiceflow/react-chat';
import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';

const IMAGE = 'https://picsum.photos/seed/1/200/300';
const AVATAR = 'https://picsum.photos/seed/1/80/80';

const CUSTOM_MESSAGE_TYPE = 'calendar';

const Calendar: React.FC<{ message: any }> = ({ message }) => (
  <div
    style={{
      border: '1px solid #ddd',
      padding: '.5rem',
    }}
  >
    MY CUSTOM CALENDAR: {JSON.stringify(message)}
  </div>
);

export const Demo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const runtime = useRuntime({
    verify: { authorization: import.meta.env.VF_DM_API_URL },
    session: { userID: `anonymous-${Math.random()}` },
  });

  useEffect(() => {
    runtime.register({
      canHandle: ({ type }) => type === 'hello',
      handle: ({ context }, trace) => {
        context.messages.push({ type: CUSTOM_MESSAGE_TYPE, payload: JSON.parse(trace.payload) } as any);
        return context;
      },
    });
  }, []);

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
              .with({ type: TurnType.USER }, ({ id, type: _, ...props }) => <UserResponse {...props} key={id} />)
              .with({ type: TurnType.SYSTEM }, ({ id, type: _, ...props }) => {
                return (
                  <SystemResponse
                    {...props}
                    key={id}
                    Message={(props) =>
                      match(props)
                        .with({ message: { type: CUSTOM_MESSAGE_TYPE as any } }, () => {
                          return <Calendar message={props.message} />;
                        })
                        .otherwise(() => {
                          return <SystemResponse.SystemMessage {...props} />;
                        })
                    }
                    avatar={AVATAR}
                    isLast={turnIndex === runtime.session.turns.length - 1}
                  />
                );
              })
              .exhaustive()
          )}
          {runtime.indicator && <SystemResponse.Indicator avatar={AVATAR} />}
        </Chat>
      </ChatWindow.Container>
    </div>
  );
};
