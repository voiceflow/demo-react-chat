/* eslint-disable no-await-in-loop, no-restricted-syntax */
import 'dotenv/config';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressWS from 'express-ws';
import { Client as IntercomClient } from 'intercom-client';
import { match } from 'ts-pattern';
import { WebSocket } from 'ws';

import { assignLiveAgent, connectLiveAgent, disconnectLiveAgent, restoreConversation, sendLiveAgentMessage } from './sockets';

const { app } = expressWS(express());
const intercom = new IntercomClient({ tokenAuth: { token: process.env.INTERCOM_TOKEN! } });

const conversationSockets = new Map<string, WebSocket>();

const getConversationSocket = (conversationID: string) => {
  const ws = conversationSockets.get(conversationID);
  if (ws) return ws;

  console.log('conversation not found');
  return null;
};

app.ws('/user/:userID/conversation/:conversationID/socket', async (ws, req) => {
  const { userID, conversationID } = req.params;

  // const conversation = await intercom.conversations.find({ id: conversationID });

  // ws.on('message', async (message) => {
  //   const event = JSON.parse(message.toString());

  //   await match(event.type)
  //     .with('user:message', async () => {
  //       console.log('User Message', event);

  //       await intercom.conversations.replyByIdAsUser({
  //         id: conversationID,
  //         userId: userID,
  //         body: event.data.message,
  //       });
  //     })

  //     .otherwise(() => {
  //       console.log('unexpected websocket message', event);
  //     });
  // });

  // restoreConversation(ws, conversation);

  // conversationSockets.set(conversationID, ws);
});

app.use(cors());
app.use(bodyParser.json());

app.post('/webhook', async (req, res, next) => {
  const { topic, data } = req.body;

  await match(topic)
    .with('conversation.admin.assigned', async () => {
      console.log('Live Agent Assigned', data);

      const conversation = data.item;
      const ws = getConversationSocket(conversation.id);
      if (!ws) return;

      assignLiveAgent(ws, conversation);
    })

    .with('conversation.admin.closed', async () => {
      console.log('Live Agent Disconnected', data);

      const conversation = data.item;
      const ws = getConversationSocket(conversation.id);
      if (!ws) return;

      disconnectLiveAgent(ws, conversation);
    })

    .with('conversation.admin.opened', async () => {
      console.log('Live Agent Connected', data);

      const conversation = data.item;
      const ws = getConversationSocket(conversation.id);
      if (!ws) return;

      connectLiveAgent(ws, conversation);
    })

    .with('conversation.admin.replied', async () => {
      console.log('Live Agent Message', data);

      const conversation = data.item;
      const message = conversation.source.body;
      const ws = getConversationSocket(conversation.id);
      if (!ws) return;

      sendLiveAgentMessage(ws, message);
    })

    .with('conversation.user.created', async () => {
      console.log('User Initiate Conversation', data);
    })

    .with('conversation.user.replied', async () => {
      console.log('User Message', data);
    })

    .otherwise(() => {
      console.log('unknown topic', topic);
    });

  res.send('ok');
});

app.post('/conversation', async (req, res) => {
  const { userID, history } = req.body;

  let finalUserID = null;
  try {
    const existingUser = await intercom.contacts.find({ id: userID });
    finalUserID = existingUser.id;
  } catch (e) {
    const user = await intercom.contacts.createLead();
    finalUserID = user.id;
  }

  const conversation = await intercom.conversations.create({
    userId: finalUserID,
    // eslint-disable-next-line xss/no-mixed-html
    body: '<strong>A Webchat user has requested to speak with a Live Agent. The following is a transcript of the conversation with the Voiceflow Assistant:</strong>',
  });

  res.json({ userID: finalUserID, conversationID: conversation.conversation_id });

  for (const { author, text } of history) {
    await intercom.conversations.replyByIdAsUser({
      id: conversation.conversation_id!,
      intercomUserId: finalUserID,
      body: `<strong>${author}:</strong> ${text}`,
    });
  }
});

app.get('/conversation/:conversationID', async (req, res) => {
  const { conversationID } = req.params;

  const conversation = await intercom.conversations.find({ id: conversationID });

  res.json({ conversation });
});

app.listen(9099);
console.log('server is running on port 9099');
