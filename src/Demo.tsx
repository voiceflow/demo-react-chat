import 'react-calendar/dist/Calendar.css';

import {
  Chat,
  ChatWindow,
  Launcher,
  RuntimeAPIProvider,
  SessionStatus,
  SystemResponse,
  TurnType,
  UserResponse,
  useRuntime,
} from '@voiceflow/react-chat';
import { useState } from 'react';
import { match } from 'ts-pattern';

import { LiveAgentStatus } from './components/LiveAgentStatus.component';
import { CustomMessage } from './custom-message.enum';
import { CalendarMessage } from './messages/CalendarMessage.component';
import { VideoMessage } from './messages/VideoMessage.component';
import { AccountInfoTrace } from './traces/account-info.trace';
import { CalendarTrace } from './traces/calendar.trace';
import { TalkToAgentTrace } from './traces/talk-to-agent.trace';
import { VideoTrace } from './traces/video.trace';
import { useLiveAgent } from './use-live-agent.hook';

const IMAGE = 'https://picsum.photos/seed/1/200/300';
const AVATAR = 'https://picsum.photos/seed/1/80/80';

export const Demo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const runtime = useRuntime({
    verify: { authorization: import.meta.env.VF_DM_API_KEY },
    session: { userID: `anonymous-${Math.random()}` },
    traces: [AccountInfoTrace, CalendarTrace, VideoTrace, TalkToAgentTrace(() => liveAgent.talkToAgent())],
  });
  const liveAgent = useLiveAgent(runtime);

  const handleLaunch = async () => {
    setOpen(true);
    await runtime.launch();
  };

  const handleEnd = () => {
    runtime.setStatus(SessionStatus.ENDED);
    setOpen(false);
  };

  const handleSend = (message: string) => {
    // if (liveAgent.isEnabled) {
    //   liveAgent.sendUserReply(message);
    // } else {
    runtime.reply(message);
    // }
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
            onSend={handleSend}
            onMinimize={handleEnd}
          >
            {/* {liveAgent.isEnabled && <LiveAgentStatus talkToRobot={liveAgent.talkToRobot} />} */}
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
                          <CalendarMessage
                            {...props}
                            value={new Date(today)}
                            onChange={(date) => runtime.interact({ type: 'done', payload: date })}
                          />
                        ))
                        .with({ type: CustomMessage.VIDEO }, ({ payload: url }) => <VideoMessage url={url} />)
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
