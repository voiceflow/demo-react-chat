import { Message, SystemResponse, useRuntime } from '@voiceflow/react-chat';
import Calendar from 'react-calendar';

export interface SystemMessageProps extends React.ComponentProps<(typeof SystemResponse)['SystemMessage']> {
  value: Date;
  runtime: ReturnType<typeof useRuntime>;
}

export const CalendarMessage: React.FC<SystemMessageProps> = ({ value, runtime, ...props }) => {
  const handleChange = async (date: Date) => {
    /**
     * You must use the runtime API to store this value in a variable.
     *
     * https://developer.voiceflow.com/reference/updatestatevariables-1
     *
     * Without this, the conversation will not have access to the chosen date.
     * You can alternatively integrate your own state storage API.
     */

    await fetch(`https://general-runtime.voiceflow.com/state/user/${runtime.session.userID}/variables`, {
      method: 'PATCH',
      body: JSON.stringify({ appointment_date: date }),
      headers: {
        authorization: import.meta.env.VF_DM_API_KEY,
        'content-type': 'application/json',
      },
    });

    return runtime.interact({ type: 'done', payload: null });
  };

  return (
    <SystemResponse.SystemMessage {...props}>
      <Message from="system">
        <Calendar value={value} onChange={(next) => handleChange(next as Date)} />
      </Message>
    </SystemResponse.SystemMessage>
  );
};
