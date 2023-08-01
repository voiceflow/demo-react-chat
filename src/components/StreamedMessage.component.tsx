import { SystemResponse } from '@voiceflow/react-chat';
import { useEffect, useMemo, useState } from 'react';

export const StreamedMessage: React.FC<{ getSocket: () => WebSocket }> = ({ getSocket }) => {
  const [text, setText] = useState('');

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    socket.onmessage = (event) => {
      setText((prev) => `${prev} ${event.data}`);
    };
  }, []);

  return <SystemResponse.SystemMessage avatar="" timestamp={0} withImage={false} message={{ type: 'text', text }} />;
};
