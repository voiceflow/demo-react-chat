import { Message, SystemResponse } from '@voiceflow/react-chat';
import Calendar from 'react-calendar';

export interface SystemMessageProps extends React.ComponentProps<(typeof SystemResponse)['SystemMessage']> {
  value: Date;
  onChange: (date: Date) => void;
}

export const CalendarMessage: React.FC<SystemMessageProps> = ({ value, onChange, ...props }) => (
  <SystemResponse.SystemMessage {...props}>
    <Message from="system">
      <Calendar value={value} onChange={(next) => onChange(next as Date)} />
    </Message>
  </SystemResponse.SystemMessage>
);
